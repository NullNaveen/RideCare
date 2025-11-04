/**
 * Dashboard.tsx
 * 
 * Main dashboard screen showing:
 * - Current odometer (from BLE or manual)
 * - Upcoming maintenance items
 * - Recent trips summary
 * - Quick actions (start trip, add maintenance)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import BLEService from '../services/BLEService';
import MaintenanceEngine, { MaintenanceDue } from '../services/MaintenanceEngine';
import LocationService from '../services/LocationService';

interface DashboardProps {
  navigation: any;
}

const Dashboard: React.FC<DashboardProps> = ({ navigation }) => {
  const [odometer, setOdometer] = useState<number>(0);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [maintenanceDue, setMaintenanceDue] = useState<MaintenanceDue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bleConnected, setBleConnected] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to BLE updates
    const bleUnsubscribe = BLEService.addListener(data => {
      setOdometer(data.odometer);
    });

    const bleConnectionUnsubscribe = BLEService.addConnectionListener(connected => {
      setBleConnected(connected);
    });

    // Subscribe to location tracking state
    const locationUnsubscribe = LocationService.addListener(location => {
      // Update UI when tracking
    });

    // Load maintenance due
    loadMaintenanceDue();

    // Check if BLE is connected
    setBleConnected(BLEService.isConnected());

    // Check if tracking is active
    setIsTracking(LocationService.isTracking);

    setLoading(false);

    return () => {
      bleUnsubscribe();
      bleConnectionUnsubscribe();
      locationUnsubscribe();
    };
  }, []);

  const loadMaintenanceDue = () => {
    // In production, load from database
    // For now, use mock data
    const mockHistory: any[] = [];
    const dueItems = MaintenanceEngine.evaluateRules(odometer, mockHistory);
    setMaintenanceDue(dueItems);
  };

  const handleStartTrip = async () => {
    try {
      await LocationService.startTracking();
      setIsTracking(true);
    } catch (error) {
      console.error('Failed to start trip:', error);
    }
  };

  const handleStopTrip = async () => {
    try {
      const trip = await LocationService.stopTracking();
      setIsTracking(false);
      navigation.navigate('TripDetail', { trip });
    } catch (error) {
      console.error('Failed to stop trip:', error);
    }
  };

  const renderMaintenanceCard = (item: MaintenanceDue) => {
    const statusColor =
      item.status === 'overdue' ? '#F44336' : item.status === 'due' ? '#FF9800' : '#4CAF50';

    return (
      <TouchableOpacity
        key={item.rule.id}
        style={styles.maintenanceCard}
        onPress={() => navigation.navigate('MaintenanceDetail', { item })}
      >
        <View style={styles.maintenanceHeader}>
          <Text style={styles.maintenanceTitle}>{item.rule.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.maintenanceDescription}>{item.rule.description}</Text>
        <View style={styles.maintenanceFooter}>
          {item.kmUntilDue !== null && (
            <Text style={styles.footerText}>📍 {Math.abs(item.kmUntilDue)} km</Text>
          )}
          {item.daysUntilDue !== null && (
            <Text style={styles.footerText}>📅 {Math.abs(item.daysUntilDue)} days</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>RideCare</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Odometer Card */}
      <View style={styles.odometerCard}>
        <Text style={styles.odometerLabel}>Current Odometer</Text>
        <Text style={styles.odometerValue}>{odometer.toLocaleString()} km</Text>
        {bleConnected && (
          <View style={styles.bleIndicator}>
            <Text style={styles.bleText}>🔗 BLE Connected</Text>
          </View>
        )}
      </View>

      {/* Trip Tracking Button */}
      <TouchableOpacity
        style={[styles.trackingButton, isTracking && styles.trackingButtonActive]}
        onPress={isTracking ? handleStopTrip : handleStartTrip}
      >
        <Text style={styles.trackingButtonText}>
          {isTracking ? '⏹ Stop Trip' : '▶️ Start Trip'}
        </Text>
      </TouchableOpacity>

      {/* Maintenance Due */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Maintenance Due</Text>
        {maintenanceDue.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>✅ All caught up!</Text>
          </View>
        ) : (
          maintenanceDue.map(renderMaintenanceCard)
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddMaintenance')}
          >
            <Text style={styles.actionIcon}>🔧</Text>
            <Text style={styles.actionText}>Log Maintenance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Trips')}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionText}>View Trips</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2196F3',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsIcon: {
    fontSize: 24,
  },
  odometerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  odometerLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  odometerValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#212121',
  },
  bleIndicator: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
  },
  bleText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  trackingButton: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  trackingButtonActive: {
    backgroundColor: '#F44336',
  },
  trackingButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
  },
  maintenanceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  maintenanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  maintenanceDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  maintenanceFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#757575',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
});

export default Dashboard;
