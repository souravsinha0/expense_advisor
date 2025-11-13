import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Card, Text, IconButton } from 'react-native-paper';
import { addToHomeScreen, isPWA } from '../utils/pwa';
import { theme } from '../utils/theme';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkInstallPrompt = () => {
      try {
        if (!isPWA() && window.deferredPrompt) {
          setShowPrompt(true);
        }
      } catch (e) {
        console.warn('PWA install prompt check failed:', e);
      }
    };

    try {
      window.addEventListener('beforeinstallprompt', checkInstallPrompt);
      
      return () => {
        window.removeEventListener('beforeinstallprompt', checkInstallPrompt);
      };
    } catch (e) {
      console.warn('PWA event listener setup failed:', e);
    }
  }, []);

  const handleInstall = () => {
    addToHomeScreen();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Install Expense Advisor</Text>
          <Text style={styles.subtitle}>Add to home screen for quick access</Text>
        </View>
        <View style={styles.buttons}>
          <Button mode="contained" onPress={handleInstall} style={styles.installButton}>
            Install
          </Button>
          <IconButton icon="close" onPress={handleDismiss} />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: theme.colors.primary,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 14,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  installButton: {
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
});