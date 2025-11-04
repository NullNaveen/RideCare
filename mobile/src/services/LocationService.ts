/**
 * Location Tracking Service
 * Handles GPS tracking with adaptive sampling for battery optimization
 */

import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import BackgroundActions from 'react-native-background-actions';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  speed: number; // m/s
  accuracy: number;
  timestamp: number;
}

export interface TripData {
  id: string;
  startTime: number;
  endTime?: number;
  points: LocationUpdate[];
  distance: number; // km
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
}

class LocationService {
  private watchId: number | null = null;
  private isTracking: boolean = false;
  private currentTrip: TripData | null = null;
  private locationBuffer: LocationUpdate[] = [];
  private lastKnownSpeed: number = 0;
  private stationaryStartTime: number | null = null;

  // Configuration
  private readonly HIGH_FREQ_INTERVAL = 1000; // 1 second (speed > 20 km/h)
  private readonly MED_FREQ_INTERVAL = 5000; // 5 seconds (speed 10-20 km/h)
  private readonly LOW_FREQ_INTERVAL = 30000; // 30 seconds (speed < 10 km/h)
  private readonly STATIONARY_THRESHOLD = 10 * 60 * 1000; // 10 minutes
  private readonly AUTO_START_SPEED = 10; // km/h
  private readonly AUTO_STOP_SPEED = 5; // km/h

  constructor() {}

  /**
   * Request location permissions (iOS: Always, Android: Fine + Background)
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const whenInUseStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (whenInUseStatus !== RESULTS.GRANTED) {
        return false;
      }

      // Request Always permission with rationale
      const alwaysStatus = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
      return alwaysStatus === RESULTS.GRANTED;
    } else {
      // Android: Request Fine location first
      const fineStatus = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'RideCare Location Permission',
          message: 'RideCare needs access to your location to track trips automatically.',
          buttonPositive: 'Allow',
        }
      );

      if (fineStatus !== PermissionsAndroid.RESULTS.GRANTED) {
        return false;
      }

      // Android 10+: Request background location separately
      if (Platform.Version >= 29) {
        const backgroundStatus = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message: 'Allow RideCare to track trips even when the app is closed.',
            buttonPositive: 'Allow',
          }
        );
        return backgroundStatus === PermissionsAndroid.RESULTS.GRANTED;
      }

      return true;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const status = await check(PERMISSIONS.IOS.LOCATION_ALWAYS);
      return status === RESULTS.GRANTED;
    } else {
      const fineStatus = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (Platform.Version >= 29) {
        const backgroundStatus = await check(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
        return fineStatus === RESULTS.GRANTED && backgroundStatus === RESULTS.GRANTED;
      }
      return fineStatus === RESULTS.GRANTED;
    }
  }

  /**
   * Start location tracking
   */
  async startTracking(onLocationUpdate?: (location: LocationUpdate) => void): Promise<void> {
    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      throw new Error('Location permissions not granted');
    }

    if (this.isTracking) {
      console.warn('Location tracking already started');
      return;
    }

    this.isTracking = true;
    this.currentTrip = {
      id: this.generateTripId(),
      startTime: Date.now(),
      points: [],
      distance: 0,
      avgSpeed: 0,
      maxSpeed: 0,
    };

    // Start background task (Android foreground service)
    if (Platform.OS === 'android') {
      await this.startBackgroundService();
    }

    // Start watching location
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const location: LocationUpdate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed || 0,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        this.handleLocationUpdate(location);

        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      },
      (error) => {
        console.error('Location error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: this.getCurrentInterval(),
        fastestInterval: 1000,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );

    console.log('Location tracking started');
  }

  /**
   * Stop location tracking
   */
  async stopTracking(): Promise<TripData | null> {
    if (!this.isTracking) {
      return null;
    }

    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (Platform.OS === 'android') {
      await BackgroundActions.stop();
    }

    this.isTracking = false;

    // Finalize trip
    if (this.currentTrip) {
      this.currentTrip.endTime = Date.now();
      this.currentTrip.distance = this.calculateTotalDistance();
      this.currentTrip.avgSpeed = this.calculateAvgSpeed();
      this.currentTrip.maxSpeed = this.calculateMaxSpeed();

      const trip = { ...this.currentTrip };
      this.currentTrip = null;
      this.locationBuffer = [];

      console.log('Trip ended:', trip);
      return trip;
    }

    return null;
  }

  /**
   * Handle incoming location updates
   */
  private handleLocationUpdate(location: LocationUpdate): void {
    if (!this.currentTrip) {
      return;
    }

    // Add to buffer
    this.locationBuffer.push(location);
    this.currentTrip.points.push(location);

    // Update last known speed (convert m/s to km/h)
    this.lastKnownSpeed = location.speed * 3.6;

    // Check for auto-stop condition (stationary for >10 min)
    if (this.lastKnownSpeed < this.AUTO_STOP_SPEED) {
      if (!this.stationaryStartTime) {
        this.stationaryStartTime = Date.now();
      } else if (Date.now() - this.stationaryStartTime > this.STATIONARY_THRESHOLD) {
        console.log('Auto-stop: Stationary for 10 minutes');
        this.stopTracking();
      }
    } else {
      this.stationaryStartTime = null;
    }

    // Adjust sampling interval based on speed (adaptive)
    this.adjustSamplingInterval();
  }

  /**
   * Calculate total distance using Haversine formula
   */
  private calculateTotalDistance(): number {
    if (!this.currentTrip || this.currentTrip.points.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    const points = this.currentTrip.points;

    for (let i = 1; i < points.length; i++) {
      const distance = this.haversineDistance(
        points[i - 1].latitude,
        points[i - 1].longitude,
        points[i].latitude,
        points[i].longitude
      );
      totalDistance += distance;
    }

    return totalDistance; // in km
  }

  /**
   * Haversine distance formula (returns km)
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate average speed (km/h)
   */
  private calculateAvgSpeed(): number {
    if (!this.currentTrip || this.currentTrip.points.length === 0) {
      return 0;
    }

    const totalSpeed = this.currentTrip.points.reduce((sum, point) => sum + point.speed * 3.6, 0);
    return totalSpeed / this.currentTrip.points.length;
  }

  /**
   * Calculate maximum speed (km/h)
   */
  private calculateMaxSpeed(): number {
    if (!this.currentTrip || this.currentTrip.points.length === 0) {
      return 0;
    }

    return Math.max(...this.currentTrip.points.map((point) => point.speed * 3.6));
  }

  /**
   * Adjust GPS sampling interval based on speed (battery optimization)
   */
  private adjustSamplingInterval(): void {
    // This would require restarting the watch with new interval
    // For simplicity, interval is set once at start
    // In production, use react-native-background-geolocation with dynamic intervals
  }

  /**
   * Get current sampling interval based on speed
   */
  private getCurrentInterval(): number {
    if (this.lastKnownSpeed > 20) {
      return this.HIGH_FREQ_INTERVAL;
    } else if (this.lastKnownSpeed > 10) {
      return this.MED_FREQ_INTERVAL;
    } else {
      return this.LOW_FREQ_INTERVAL;
    }
  }

  /**
   * Start Android foreground service
   */
  private async startBackgroundService(): Promise<void> {
    const options = {
      taskName: 'RideCare Trip Tracking',
      taskTitle: 'RideCare',
      taskDesc: 'Tracking your ride',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#2196F3',
      linkingURI: 'ridecare://tracking',
      progressBar: {
        max: 100,
        value: 0,
        indeterminate: true,
      },
    };

    await BackgroundActions.start(async () => {
      // Background task keeps running
      // Location updates are handled by watchPosition
    }, options);
  }

  /**
   * Generate unique trip ID
   */
  private generateTripId(): string {
    return `trip_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get current trip data
   */
  getCurrentTrip(): TripData | null {
    return this.currentTrip;
  }

  /**
   * Check if tracking is active
   */
  isTrackingActive(): boolean {
    return this.isTracking;
  }
}

export default new LocationService();
