import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from '../utils/theme';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'reports', label: 'Reports', icon: '📈' },
  { id: 'aiChat', label: 'AI Chat', icon: '💬' },
];

export default function BottomTabNavigator({ currentTab, onTabChange }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            currentTab === tab.id && styles.activeTab,
          ]}
          onPress={() => onTabChange(tab.id)}
        >
          <Text style={styles.icon}>{tab.icon}</Text>
          <Text
            style={[
              styles.label,
              currentTab === tab.id && styles.activeLabel,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    borderTopColor: '#E0E0E0',
    paddingBottom: 1,
    paddingTop: 8,
    elevation: 8,
    minHeight: 10,
    width: '100%',
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.primary,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#757575',
  },
  activeLabel: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
