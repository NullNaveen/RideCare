/**
 * Settings.tsx
 * 
 * App settings including profile, preferences, data management, and about.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';

interface SettingsProps {
  navigation: any;
}

const Settings: React.FC<SettingsProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [autoTracking, setAutoTracking] = useState(true);
  const [cloudSync, setCloudSync] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'CSV', onPress: () => exportData('csv') },
        { text: 'JSON', onPress: () => exportData('json') },
      ]
    );
  };

  const exportData = (format: string) => {
    console.log(`Exporting data as ${format}`);
    // Implement data export (GDPR requirement)
    Alert.alert('Export Started', `Your data will be exported as ${format.toUpperCase()}`);
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your trips, maintenance records, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Deleting all data');
            Alert.alert('Data Deleted', 'All your data has been deleted.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('Logging out');
            // Clear auth and navigate to login
          },
        },
      ]
    );
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const SettingRow = ({
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PROFILE</Text>
        <View style={styles.card}>
          <SettingRow
            title="Account"
            subtitle="user@example.com"
            onPress={() => navigation.navigate('Profile')}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Subscription"
            subtitle="Free Plan"
            onPress={() => navigation.navigate('Subscription')}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <View style={styles.card}>
          <SettingRow
            title="Notifications"
            subtitle="Get maintenance reminders"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            title="Auto Trip Tracking"
            subtitle="Automatically detect and record trips"
            rightElement={
              <Switch
                value={autoTracking}
                onValueChange={setAutoTracking}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            title="Cloud Sync"
            subtitle="Sync data across devices (Pro)"
            rightElement={
              <Switch
                value={cloudSync}
                onValueChange={setCloudSync}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor="#FFFFFF"
                disabled={true}
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            title="Dark Mode"
            subtitle="Coming soon"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor="#FFFFFF"
                disabled={true}
              />
            }
          />
        </View>
      </View>

      {/* Bike Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>BIKE</Text>
        <View style={styles.card}>
          <SettingRow
            title="My Bikes"
            subtitle="Manage your vehicles"
            onPress={() => navigation.navigate('ManageBikes')}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Bluetooth Pairing"
            subtitle="Connect to your bike"
            onPress={() => navigation.navigate('BLEPairing')}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Maintenance Rules"
            subtitle="Customize maintenance intervals"
            onPress={() => navigation.navigate('MaintenanceRules')}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
        </View>
      </View>

      {/* Data & Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>DATA & PRIVACY</Text>
        <View style={styles.card}>
          <SettingRow
            title="Export Data"
            subtitle="Download your data (CSV/JSON)"
            onPress={handleExportData}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Privacy Policy"
            subtitle="View our privacy policy"
            onPress={() => openURL('https://ridecare.app/privacy')}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Terms of Service"
            subtitle="View terms and conditions"
            onPress={() => openURL('https://ridecare.app/terms')}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>ABOUT</Text>
        <View style={styles.card}>
          <SettingRow
            title="Version"
            rightElement={<Text style={styles.versionText}>1.0.0</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Help & Support"
            onPress={() => openURL('https://ridecare.app/support')}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Rate Us"
            onPress={() => console.log('Open app store rating')}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Share App"
            onPress={() => console.log('Share app')}
            rightElement={<Text style={styles.arrow}>›</Text>}
          />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>DANGER ZONE</Text>
        <View style={styles.card}>
          <SettingRow
            title="Delete All Data"
            subtitle="Permanently delete all local data"
            onPress={handleDeleteAllData}
            rightElement={<Text style={[styles.arrow, styles.dangerText]}>›</Text>}
          />
          <View style={styles.divider} />
          <SettingRow
            title="Logout"
            onPress={handleLogout}
            rightElement={<Text style={[styles.arrow, styles.dangerText]}>›</Text>}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for riders</Text>
        <Text style={styles.footerText}>© 2025 RideCare</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9E9E9E',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 56,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  arrow: {
    fontSize: 24,
    color: '#BDBDBD',
    fontWeight: '300',
  },
  versionText: {
    fontSize: 14,
    color: '#757575',
  },
  dangerText: {
    color: '#F44336',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    padding: 32,
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
});

export default Settings;
