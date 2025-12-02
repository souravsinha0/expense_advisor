import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar-today' },
  { id: 'reports', label: 'Reports', icon: 'assessment' },
  { id: 'aiChat', label: 'AI Chat', icon: 'smart-toy' },
];

export default function SideTabNavigator({ currentTab, onTabChange }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.navItems}>
        {TABS.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isActive && styles.activeTab,
              ]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={tab.icon}
                size={26}
                color={isActive ? '#ffffff' : '#b0b0b0'}
              />
              <Text style={[
                styles.label,
                isActive && styles.activeLabel
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    backgroundColor: '#1e1b4b', // Deep elegant background
    borderRightWidth: 1,
    borderRightColor: '#333',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
  },

  navItems: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },

  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginVertical: 8,
    borderRadius: 16,
    marginHorizontal: 10,
  },

  // Transparent & beautiful active highlight
  activeTab: {
    backgroundColor: 'rgba(79, 70, 229, 0.25)', // Semi-transparent purple — icon fully visible!
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },

  label: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: '#b0b0b0',
    textAlign: 'center',
  },

  activeLabel: {
    color: '#ffffff',
    fontWeight: '700',
  },
});