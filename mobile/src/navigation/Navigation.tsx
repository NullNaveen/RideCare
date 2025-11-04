/**
 * Navigation.tsx
 * 
 * React Navigation configuration with Stack and Tab navigators.
 * Handles deep linking and state persistence.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import Onboarding from '../screens/Onboarding';
import Dashboard from '../screens/Dashboard';
import TripDetail from '../screens/TripDetail';
import MaintenanceHistory from '../screens/MaintenanceHistory';
import AddMaintenance from '../screens/AddMaintenance';
import Settings from '../screens/Settings';
import BLEPairing from '../screens/BLEPairing';

// Types
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  TripDetail: { trip: any };
  AddMaintenance: undefined;
  BLEPairing: undefined;
  MaintenanceDetail: { event: any };
  ExportData: { tripId?: string };
  Profile: undefined;
  Subscription: undefined;
  ManageBikes: undefined;
  MaintenanceRules: undefined;
};

export type TabParamList = {
  Home: undefined;
  Trips: undefined;
  Maintenance: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={Dashboard}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="Trips"
        component={TripsPlaceholder}
        options={{
          tabBarLabel: 'Trips',
          tabBarIcon: ({ color, size }) => <TabIcon icon="🗺️" color={color} />,
        }}
      />
      <Tab.Screen
        name="Maintenance"
        component={MaintenanceHistory}
        options={{
          tabBarLabel: 'Maintenance',
          tabBarIcon: ({ color, size }) => <TabIcon icon="🔧" color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <TabIcon icon="⚙️" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Simple tab icon component
const TabIcon = ({ icon, color }: { icon: string; color: string }) => (
  <span style={{ fontSize: 24, opacity: color === '#2196F3' ? 1 : 0.5 }}>{icon}</span>
);

// Placeholder for Trips list screen
const TripsPlaceholder = ({ navigation }: any) => {
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <h2>Trips Screen</h2>
      <p>List of all trips will be displayed here</p>
    </div>
  );
};

// Main Navigation
const Navigation = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(false);

  React.useEffect(() => {
    // Check if onboarding is complete
    // AsyncStorage.getItem('onboarding_completed').then(value => {
    //   setIsOnboardingComplete(value === 'true');
    // });
    
    // For demo, skip onboarding
    setIsOnboardingComplete(true);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isOnboardingComplete ? (
          <Stack.Screen
            name="Onboarding"
            options={{ headerShown: false }}
          >
            {props => (
              <Onboarding
                {...props}
                onComplete={() => setIsOnboardingComplete(true)}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TripDetail"
              component={TripDetail}
              options={{ title: 'Trip Details' }}
            />
            <Stack.Screen
              name="AddMaintenance"
              component={AddMaintenance}
              options={{ title: 'Log Maintenance' }}
            />
            <Stack.Screen
              name="BLEPairing"
              component={BLEPairing}
              options={{ title: 'Bluetooth Pairing' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
