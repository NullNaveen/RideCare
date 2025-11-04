/**
 * BLEService.ts
 * 
 * Bluetooth Low Energy service for pairing with BS6-compliant bikes
 * (TVS, Royal Enfield, etc.) to read odometer and speed data via GATT.
 * 
 * Features:
 * - Device scanning with timeout
 * - Auto-reconnect on disconnect
 * - GATT characteristic reading (odometer, speed, battery)
 * - Permission handling (iOS/Android)
 * - Connection state management
 */

import { BleManager, Device, Characteristic } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

// Standard BLE UUIDs (example - actual UUIDs vary by manufacturer)
const BIKE_SERVICE_UUID = '0000180A-0000-1000-8000-00805F9B34FB'; // Device Info Service
const ODOMETER_CHAR_UUID = '00002A29-0000-1000-8000-00805F9B34FB'; // Odometer (custom)
const SPEED_CHAR_UUID = '00002A2A-0000-1000-8000-00805F9B34FB'; // Speed (custom)
const BATTERY_CHAR_UUID = '00002A19-0000-1000-8000-00805F9B34FB'; // Battery Level

export interface BLEDevice {
  id: string;
  name: string | null;
  rssi: number;
  manufacturer?: string;
}

export interface BikeData {
  odometer: number; // km
  speed: number; // km/h
  battery: number; // percentage
  timestamp: Date;
}

type BLEListener = (data: BikeData) => void;
type ConnectionListener = (connected: boolean) => void;

class BLEService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private scanTimeout: NodeJS.Timeout | null = null;
  private listeners: BLEListener[] = [];
  private connectionListeners: ConnectionListener[] = [];
  private isScanning = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.manager = new BleManager();
    this.initialize();
  }

  /**
   * Initialize BLE manager and set up connection monitoring
   */
  private async initialize() {
    const subscription = this.manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        console.log('BLE is ready');
      }
    }, true);

    return () => subscription.remove();
  }

  /**
   * Request Bluetooth permissions (Android 12+)
   */
  private async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        // Android 12+
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        return (
          granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
          granted['android.permission.BLUETOOTH_CONNECT'] === 'granted'
        );
      } else {
        // Android <12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === 'granted';
      }
    }
    return true; // iOS permissions handled via Info.plist
  }

  /**
   * Scan for nearby BLE devices
   * @param durationMs Scan duration in milliseconds
   * @returns Array of discovered devices
   */
  public async scanForDevices(durationMs: number = 10000): Promise<BLEDevice[]> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Bluetooth permissions not granted');
    }

    const devices: Map<string, BLEDevice> = new Map();
    this.isScanning = true;

    return new Promise((resolve, reject) => {
      this.manager.startDeviceScan(
        null, // Scan all services
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            this.isScanning = false;
            reject(error);
            return;
          }

          if (device && device.name) {
            // Filter for known bike manufacturers (TVS, Royal Enfield, Hero, Bajaj)
            const bikeBrands = ['TVS', 'ROYAL', 'HERO', 'BAJAJ', 'HONDA', 'YAMAHA'];
            const isBike = bikeBrands.some(brand =>
              device.name?.toUpperCase().includes(brand)
            );

            if (isBike) {
              devices.set(device.id, {
                id: device.id,
                name: device.name,
                rssi: device.rssi || -100,
                manufacturer: device.manufacturerData
                  ? this.parseManufacturerData(device.manufacturerData)
                  : undefined,
              });
            }
          }
        }
      );

      // Stop scan after duration
      this.scanTimeout = setTimeout(() => {
        this.manager.stopDeviceScan();
        this.isScanning = false;
        resolve(Array.from(devices.values()));
      }, durationMs);
    });
  }

  /**
   * Stop ongoing device scan
   */
  public stopScan() {
    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
        this.scanTimeout = null;
      }
    }
  }

  /**
   * Connect to a BLE device by ID
   */
  public async connectToDevice(deviceId: string): Promise<void> {
    try {
      const device = await this.manager.connectToDevice(deviceId);
      this.connectedDevice = device;
      this.reconnectAttempts = 0;

      // Discover services and characteristics
      await device.discoverAllServicesAndCharacteristics();

      // Setup disconnect listener
      device.onDisconnected((error, disconnectedDevice) => {
        console.log('Device disconnected:', error);
        this.connectedDevice = null;
        this.notifyConnectionListeners(false);
        this.attemptReconnect(disconnectedDevice!.id);
      });

      this.notifyConnectionListeners(true);

      // Start monitoring characteristics
      await this.startMonitoring();
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from current device
   */
  public async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      await this.manager.cancelDeviceConnection(this.connectedDevice.id);
      this.connectedDevice = null;
      this.notifyConnectionListeners(false);
    }
  }

  /**
   * Start monitoring bike data characteristics
   */
  private async startMonitoring() {
    if (!this.connectedDevice) return;

    try {
      // Monitor odometer
      this.connectedDevice.monitorCharacteristicForService(
        BIKE_SERVICE_UUID,
        ODOMETER_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Odometer monitoring error:', error);
            return;
          }
          this.handleCharacteristicUpdate(characteristic!);
        }
      );

      // Monitor speed
      this.connectedDevice.monitorCharacteristicForService(
        BIKE_SERVICE_UUID,
        SPEED_CHAR_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Speed monitoring error:', error);
            return;
          }
          this.handleCharacteristicUpdate(characteristic!);
        }
      );

      // Read battery level (one-time)
      const batteryChar = await this.connectedDevice.readCharacteristicForService(
        BIKE_SERVICE_UUID,
        BATTERY_CHAR_UUID
      );
      this.handleCharacteristicUpdate(batteryChar);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
    }
  }

  /**
   * Handle characteristic value updates
   */
  private handleCharacteristicUpdate(characteristic: Characteristic) {
    const value = characteristic.value;
    if (!value) return;

    // Decode base64 value
    const buffer = Buffer.from(value, 'base64');

    // Example decoding (actual format depends on manufacturer)
    let bikeData: Partial<BikeData> = {
      timestamp: new Date(),
    };

    switch (characteristic.uuid) {
      case ODOMETER_CHAR_UUID:
        bikeData.odometer = buffer.readUInt32LE(0); // Assume 4-byte unsigned int
        break;
      case SPEED_CHAR_UUID:
        bikeData.speed = buffer.readUInt16LE(0); // Assume 2-byte unsigned int
        break;
      case BATTERY_CHAR_UUID:
        bikeData.battery = buffer.readUInt8(0); // 1-byte percentage
        break;
    }

    // Notify listeners if we have complete data
    if (bikeData.odometer !== undefined || bikeData.speed !== undefined) {
      this.notifyListeners(bikeData as BikeData);
    }
  }

  /**
   * Attempt to reconnect after disconnect
   */
  private async attemptReconnect(deviceId: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    setTimeout(async () => {
      try {
        await this.connectToDevice(deviceId);
      } catch (error) {
        console.error('Reconnect failed:', error);
      }
    }, 5000); // Wait 5 seconds before retry
  }

  /**
   * Parse manufacturer data to extract brand name
   */
  private parseManufacturerData(data: string): string | undefined {
    // Manufacturer data format varies; this is a placeholder
    // Real implementation would decode company identifier
    return undefined;
  }

  /**
   * Subscribe to bike data updates
   */
  public addListener(callback: BLEListener): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Subscribe to connection state changes
   */
  public addConnectionListener(callback: ConnectionListener): () => void {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners of new bike data
   */
  private notifyListeners(data: BikeData) {
    this.listeners.forEach(listener => listener(data));
  }

  /**
   * Notify all connection listeners
   */
  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  /**
   * Get current connection status
   */
  public isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  /**
   * Get connected device info
   */
  public getConnectedDevice(): BLEDevice | null {
    if (!this.connectedDevice) return null;
    return {
      id: this.connectedDevice.id,
      name: this.connectedDevice.name,
      rssi: this.connectedDevice.rssi || -100,
    };
  }
}

export default new BLEService();
