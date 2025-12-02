import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

// Main Screens
import DashboardScreen from '../screens/DashboardScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ReportsScreen from '../screens/ReportsScreen';
import ExpenseDetailScreen from '../screens/ExpenseDetailScreen';
import AIChat from '../screens/AIChatScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

const CustomDrawerContent = ({ navigation, state }) => {
  const routes = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Calendar', icon: '📅' },
    { name: 'Reports', icon: '📈' },
    { name: 'AI Chat', icon: '🤖' },
  ];

  return (
    <Surface style={drawerStyles.container}>
      <View style={drawerStyles.header}>
        <Text style={drawerStyles.logo}>💰</Text>
        <Text style={drawerStyles.title}>Expense Advisor</Text>
        <Text style={drawerStyles.subtitle}>Financial Intelligence</Text>
      </View>
      
      <View style={drawerStyles.menu}>
        {routes.map((route, index) => {
          const isFocused = state.index === index;
          return (
            <TouchableOpacity
              key={route.name}
              onPress={() => navigation.navigate(route.name)}
              style={[
                drawerStyles.menuItem,
                isFocused && drawerStyles.menuItemActive
              ]}
            >
              <Text style={drawerStyles.menuIcon}>{route.icon}</Text>
              <Text style={[
                drawerStyles.menuText,
                isFocused && drawerStyles.menuTextActive
              ]}>
                {route.name}
              </Text>
              {isFocused && <View style={drawerStyles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
      
      <View style={drawerStyles.footer}>
        <Text style={drawerStyles.footerText}>v1.0.0</Text>
      </View>
    </Surface>
  );
};

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'permanent',
        drawerStyle: {
          width: 280,
          backgroundColor: 'transparent',
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Calendar" component={CalendarScreen} />
      <Drawer.Screen name="Reports" component={ReportsScreen} />
      <Drawer.Screen name="AI Chat" component={AIChat} />
    </Drawer.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainDrawer" 
        component={MainDrawer} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ExpenseDetail" 
        component={ExpenseDetailScreen}
        options={{ 
          title: 'Expense Details',
          headerStyle: { backgroundColor: '#4f46e5' },
          headerTintColor: '#fff'
        }}
      />
      <Stack.Screen 
        name="ProfileSetup" 
        component={ProfileSetupScreen}
        options={{ 
          title: 'Complete Profile',
          headerStyle: { backgroundColor: '#4f46e5' },
          headerTintColor: '#fff'
        }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthStack />;
  }

  if (!user?.is_profile_complete) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      </Stack.Navigator>
    );
  }

  return <MainStack />;
}

const drawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(79, 70, 229, 0.1)',
  },
  header: {
    padding: 32,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 70, 229, 0.1)',
  },
  logo: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4f46e5',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  menu: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 16,
    position: 'relative',
  },
  menuItemActive: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  menuTextActive: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    width: 4,
    height: '60%',
    backgroundColor: '#4f46e5',
    borderRadius: 2,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(79, 70, 229, 0.1)',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});