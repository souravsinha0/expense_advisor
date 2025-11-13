import React from 'react';
import { View } from 'react-native';

/**
 * ScreenWrapper ensures that screen content fills available space
 * and works properly with the bottom navigation bar
 */
export default function ScreenWrapper({ children }) {
  return (
    <View style={{ flex: 1, width: '100%', height: '100%' }}>
      {children}
    </View>
  );
}
