/**
 * Button.tsx
 * 
 * Reusable button component following the design system.
 * Supports primary, secondary, and danger variants.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    };

    // Size
    switch (size) {
      case 'small':
        baseStyle.height = 40;
        baseStyle.paddingHorizontal = 16;
        break;
      case 'large':
        baseStyle.height = 56;
        baseStyle.paddingHorizontal = 32;
        break;
      default: // medium
        baseStyle.height = 48;
        baseStyle.paddingHorizontal = 24;
    }

    // Variant
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = '#2196F3';
        break;
      case 'secondary':
        baseStyle.backgroundColor = '#4CAF50';
        break;
      case 'danger':
        baseStyle.backgroundColor = '#F44336';
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = '#2196F3';
        break;
    }

    // Full width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Disabled
    if (disabled) {
      baseStyle.backgroundColor = '#BDBDBD';
      baseStyle.borderColor = '#BDBDBD';
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: 'bold',
      color: '#FFFFFF',
    };

    // Size
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
      default: // medium
        baseStyle.fontSize = 16;
    }

    // Outline variant
    if (variant === 'outline') {
      baseStyle.color = disabled ? '#BDBDBD' : '#2196F3';
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <>
          {icon && <Text style={[styles.icon, { fontSize: size === 'small' ? 16 : 20 }]}>{icon}</Text>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
  },
});

export default Button;
