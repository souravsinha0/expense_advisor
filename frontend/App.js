import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import SideTabNavigator from './src/components/BottomTabNavigator';
import { theme } from './src/utils/theme';

// Import screens directly
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import AIChatScreen from './src/screens/AIChatScreen';

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login');
  const [currentTab, setCurrentTab] = useState('dashboard');

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      setCurrentScreen('login');
    } else if (!user?.is_profile_complete) {
      setCurrentScreen('profileSetup');
    } else {
      setCurrentScreen('dashboard');
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const navigation = {
    navigate: (screen) => {
      if (typeof screen === 'string' && screen.toLowerCase() === 'signup') {
        setCurrentScreen('signup');
      } else if (typeof screen === 'string' && screen.toLowerCase() === 'login') {
        setCurrentScreen('login');
      } else {
        setCurrentScreen('dashboard');
      }
    },
    replace: (screen) => {
      setCurrentScreen(screen);
    },
  };

  const isMainApp = isAuthenticated && user?.is_profile_complete;

  // Auth screens (no tabs)
  if (currentScreen === 'signup') {
    return <SignupScreen navigation={navigation} />;
  }
  if (currentScreen === 'profileSetup') {
    return <ProfileSetupScreen navigation={navigation} />;
  }
  if (currentScreen === 'login') {
    return <LoginScreen navigation={navigation} />;
  }

  // Main app screens with side navigation
  return (
    <View style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
      {isMainApp && (
        <SideTabNavigator 
          currentTab={currentTab} 
          onTabChange={setCurrentTab}
        />
      )}
      <View style={{ flex: 1, marginLeft: isMainApp ? 80 : 0, overflow: 'hidden' }}>
        {currentTab === 'dashboard' && <DashboardScreen navigation={navigation} />}
        {currentTab === 'calendar' && <CalendarScreen navigation={navigation} />}
        {currentTab === 'reports' && <ReportsScreen navigation={navigation} />}
        {currentTab === 'aiChat' && <AIChatScreen navigation={navigation} />}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}