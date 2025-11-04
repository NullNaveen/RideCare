/**
 * BLEPairing.tsx
 * 
 * Bluetooth Low Energy pairing screen to connect with BS6 bikes.
 * Scans for nearby bikes, shows connection status, and manages pairing.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BLEService, { BLEDevice } from '../services/BLEService';

interface BLEPairingProps {
  navigation: any;
}

const BLEPairing: React.FC<BLEPairingProps> = ({ navigation }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BLEDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if already connected
    const connected = BLEService.getConnectedDevice();
    if (connected) {
      setConnectedDevice(connected);
    }

    // Listen to connection state
    const unsubscribe = BLEService.addConnectionListener(connected => {
      if (connected) {
        const device = BLEService.getConnectedDevice();
        setConnectedDevice(device);
      } else {
        setConnectedDevice(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const startScan = async () => {
    try {
      setIsScanning(true);
      setDevices([]);
      
      const foundDevices = await BLEService.scanForDevices(10000); // 10 seconds
      setDevices(foundDevices);
      
      if (foundDevices.length === 0) {
        Alert.alert(
          'No Bikes Found',
          'Make sure your bike is on and Bluetooth is enabled. Supported bikes: TVS, Royal Enfield, Hero, Bajaj with BS6 OBD.'
        );
      }
    } catch (error) {
      console.error('Scan failed:', error);
      Alert.alert('Scan Failed', 'Failed to scan for devices. Please check Bluetooth permissions.');
    } finally {
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    BLEService.stopScan();
    setIsScanning(false);
  };

  const connectToDevice = async (device: BLEDevice) => {
    try {
      setIsConnecting(true);
      await BLEService.connectToDevice(device.id);
      Alert.alert('Connected', `Successfully connected to ${device.name}`);
      navigation.goBack();
    } catch (error) {
      console.error('Connection failed:', error);
      Alert.alert(
        'Connection Failed',
        'Could not connect to the device. Please make sure the bike is on and try again.'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectDevice = async () => {
    Alert.alert(
      'Disconnect',
      'Are you sure you want to disconnect from your bike?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await BLEService.disconnect();
              setConnectedDevice(null);
              Alert.alert('Disconnected', 'Successfully disconnected from bike');
            } catch (error) {
              console.error('Disconnect failed:', error);
            }
          },
        },
      ]
    );
  };

  const renderDevice = ({ item }: { item: BLEDevice }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => connectToDevice(item)}
      disabled={isConnecting}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
        <Text style={styles.deviceId}>ID: {item.id.substring(0, 8)}...</Text>
        {item.manufacturer && (
          <Text style={styles.deviceManufacturer}>{item.manufacturer}</Text>
        )}
      </View>
      <View style={styles.deviceSignal}>
        <Text style={styles.signalText}>
          {item.rssi > -60 ? '📶' : item.rssi > -80 ? '📶📶' : '📶📶📶'}
        </Text>
        <Text style={styles.rssiText}>{item.rssi} dBm</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bluetooth Pairing</Text>
        <Text style={styles.headerSubtitle}>
          Connect to your BS6 bike to auto-sync odometer data
        </Text>
      </View>

      {/* Connected Device */}
      {connectedDevice && (
        <View style={styles.connectedContainer}>
          <View style={styles.connectedBanner}>
            <Text style={styles.connectedIcon}>✅</Text>
            <View style={styles.connectedInfo}>
              <Text style={styles.connectedText}>Connected to</Text>
              <Text style={styles.connectedName}>{connectedDevice.name}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.disconnectButton} onPress={disconnectDevice}>
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Scan Controls */}
      <View style={styles.controlsContainer}>
        {isScanning ? (
          <TouchableOpacity style={styles.scanButton} onPress={stopScan}>
            <ActivityIndicator color="#FFFFFF" style={styles.spinner} />
            <Text style={styles.scanButtonText}>Stop Scanning</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.scanButton} onPress={startScan}>
            <Text style={styles.scanButtonText}>🔍 Start Scanning</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Device List */}
      {devices.length > 0 ? (
        <FlatList
          data={devices}
          renderItem={renderDevice}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={
            <Text style={styles.listHeader}>Found {devices.length} device(s)</Text>
          }
        />
      ) : (
        <View style={styles.emptyState}>
          {isScanning ? (
            <>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.emptyStateText}>Scanning for bikes...</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyStateIcon}>📡</Text>
              <Text style={styles.emptyStateText}>No devices found</Text>
              <Text style={styles.emptyStateHint}>
                Tap "Start Scanning" to search for nearby bikes
              </Text>
            </>
          )}
        </View>
      )}

      {/* Help Section */}
      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Troubleshooting</Text>
        <Text style={styles.helpText}>• Make sure your bike is turned on</Text>
        <Text style={styles.helpText}>• Enable Bluetooth on your phone</Text>
        <Text style={styles.helpText}>• Stay within 10 meters of your bike</Text>
        <Text style={styles.helpText}>
          • Supported: TVS, Royal Enfield, Hero, Bajaj (BS6 models)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  connectedContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  connectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  connectedIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  connectedInfo: {
    flex: 1,
  },
  connectedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  connectedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  controlsContainer: {
    padding: 16,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  spinner: {
    marginRight: 12,
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 12,
  },
  deviceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 2,
  },
  deviceManufacturer: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  deviceSignal: {
    alignItems: 'flex-end',
  },
  signalText: {
    fontSize: 16,
    marginBottom: 4,
  },
  rssiText: {
    fontSize: 10,
    color: '#9E9E9E',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#757575',
    marginBottom: 8,
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  helpContainer: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57C00',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#E65100',
    marginBottom: 4,
  },
});

export default BLEPairing;
