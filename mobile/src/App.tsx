/**
 * RideCare Mobile App
 * Main entry point
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import crashlytics from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';

import RootNavigator from './navigation/RootNavigator';
import { AuthProvider } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import { LocationProvider } from './context/LocationContext';
import { ThemeProvider } from './context/ThemeContext';

const App = (): JSX.Element => {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Initialize Crashlytics
    crashlytics().log('App mounted');
    
    // Track app open
    analytics().logAppOpen();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <DatabaseProvider>
            <AuthProvider>
              <LocationProvider>
                <StatusBar
                  barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                  backgroundColor="transparent"
                  translucent
                />
                <NavigationContainer>
                  <RootNavigator />
                </NavigationContainer>
              </LocationProvider>
            </AuthProvider>
          </DatabaseProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
