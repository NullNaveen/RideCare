/**
 * TripDetail.tsx
 * 
 * Detailed view of a completed trip with map, stats, and actions.
 * Shows route polyline, distance, duration, average speed.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';

interface Location {
  latitude: number;
  longitude: number;
  timestamp: Date;
  speed: number;
}

interface Trip {
  id: string;
  startTime: Date;
  endTime: Date;
  distance: number; // km
  locations: Location[];
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  duration: number; // minutes
}

interface TripDetailProps {
  route: any;
  navigation: any;
}

const TripDetail: React.FC<TripDetailProps> = ({ route, navigation }) => {
  const { trip } = route.params as { trip: Trip };
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (trip.locations.length > 0) {
      // Calculate map region to fit all locations
      const latitudes = trip.locations.map(loc => loc.latitude);
      const longitudes = trip.locations.map(loc => loc.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const latDelta = (maxLat - minLat) * 1.5; // Add padding
      const lngDelta = (maxLng - minLng) * 1.5;
      
      setMapRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(latDelta, 0.01),
        longitudeDelta: Math.max(lngDelta, 0.01),
      });
    }
  }, [trip]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🏍️ Rode ${trip.distance.toFixed(2)} km in ${formatDuration(trip.duration)}. Average speed: ${trip.avgSpeed.toFixed(1)} km/h. Max speed: ${trip.maxSpeed.toFixed(1)} km/h. #RideCare`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleExport = () => {
    // Export to CSV/JSON (implement data export utility)
    navigation.navigate('ExportData', { tripId: trip.id });
  };

  const polylineCoordinates = trip.locations.map(loc => ({
    latitude: loc.latitude,
    longitude: loc.longitude,
  }));

  const startMarker = trip.locations[0];
  const endMarker = trip.locations[trip.locations.length - 1];

  return (
    <ScrollView style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={mapRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* Route polyline */}
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="#2196F3"
            strokeWidth={4}
          />
          
          {/* Start marker */}
          {startMarker && (
            <Marker
              coordinate={{
                latitude: startMarker.latitude,
                longitude: startMarker.longitude,
              }}
              title="Start"
              pinColor="green"
            />
          )}
          
          {/* End marker */}
          {endMarker && (
            <Marker
              coordinate={{
                latitude: endMarker.latitude,
                longitude: endMarker.longitude,
              }}
              title="End"
              pinColor="red"
            />
          )}
        </MapView>
      </View>

      {/* Trip Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{trip.distance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>km</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatDuration(trip.duration)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{trip.avgSpeed.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Avg km/h</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{trip.maxSpeed.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Max km/h</Text>
          </View>
        </View>
      </View>

      {/* Trip Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.sectionTitle}>Trip Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Started:</Text>
          <Text style={styles.detailValue}>{formatDate(trip.startTime)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ended:</Text>
          <Text style={styles.detailValue}>{formatDate(trip.endTime)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Data Points:</Text>
          <Text style={styles.detailValue}>{trip.locations.length}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionButtonText}>📤 Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={handleExport}
        >
          <Text style={styles.actionButtonText}>💾 Export</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#E0E0E0',
  },
  map: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
  },
  detailValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '600',
  },
  actionsContainer: {
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonSecondary: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default TripDetail;
