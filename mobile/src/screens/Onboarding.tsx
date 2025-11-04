/**
 * Onboarding.tsx
 * 
 * Interactive onboarding flow explaining features and requesting permissions.
 * Shows 4 slides with skip/next navigation and final "Get Started" action.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface OnboardingProps {
  navigation: any;
  onComplete: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Automatic Trip Tracking',
    description: 'No manual logging! RideCare automatically detects when you\'re riding and tracks your trips in the background.',
    icon: '🗺️',
    color: '#2196F3',
  },
  {
    id: '2',
    title: 'Smart Maintenance Reminders',
    description: 'Get timely notifications for oil changes, chain lubrication, and services based on distance and time.',
    icon: '🔧',
    color: '#4CAF50',
  },
  {
    id: '3',
    title: 'Bluetooth Bike Pairing',
    description: 'Connect to your BS6 bike via Bluetooth to automatically sync odometer readings. No manual entry!',
    icon: '🔗',
    color: '#FF9800',
  },
  {
    id: '4',
    title: 'Privacy First, Offline First',
    description: 'All data stored locally on your device. Cloud sync is optional. We never sell your location data.',
    icon: '🔒',
    color: '#9C27B0',
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ navigation, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const scrollTo = (index: number) => {
    flatListRef.current?.scrollToIndex({ animated: true, index });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollTo(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    scrollTo(slides.length - 1);
  };

  const handleGetStarted = async () => {
    // Request permissions
    await requestPermissions();
    
    // Mark onboarding as completed
    // AsyncStorage.setItem('onboarding_completed', 'true');
    
    // Call completion handler
    onComplete();
  };

  const requestPermissions = async () => {
    try {
      // Location permission
      const locationPermission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      if (locationPermission) {
        const result = await request(locationPermission);
        console.log('Location permission:', result);
      }

      // Notification permission (iOS)
      if (Platform.OS === 'ios') {
        const notificationResult = await request(PERMISSIONS.IOS.NOTIFICATIONS);
        console.log('Notification permission:', notificationResult);
      }

      // Bluetooth permission (Android 12+)
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        const bleResult = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
        console.log('Bluetooth permission:', bleResult);
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale }], opacity }]}>
          <Text style={[styles.icon, { backgroundColor: item.color }]}>{item.icon}</Text>
        </Animated.View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * SCREEN_WIDTH,
          index * SCREEN_WIDTH,
          (index + 1) * SCREEN_WIDTH,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
                backgroundColor: slides[currentIndex].color,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        keyExtractor={item => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {renderPagination()}
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: slides[currentIndex].color }]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 48,
  },
  icon: {
    fontSize: 96,
    width: 160,
    height: 160,
    textAlign: 'center',
    lineHeight: 160,
    borderRadius: 80,
    overflow: 'hidden',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    height: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default Onboarding;
