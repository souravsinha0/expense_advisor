import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary componentDidCatch:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>⚠️ Application Error</Text>
            <Text style={styles.subtitle}>Something went wrong:</Text>
            <Text style={styles.message}>{String(this.state.error?.toString?.() || this.state.error)}</Text>
            {this.state.info && (
              <>
                <Text style={styles.stackTitle}>Stack Trace:</Text>
                <Text style={styles.stack}>{String(this.state.info.componentStack)}</Text>
              </>
            )}
            <Text style={styles.helpText}>
              Check the browser console (F12) for more details. Try refreshing the page.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    padding: 20,
  },
  content: { 
    paddingVertical: 20,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    marginBottom: 12,
    color: '#c62828',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  message: { 
    color: '#d32f2f', 
    marginBottom: 16,
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4,
  },
  stackTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  stack: { 
    color: '#666', 
    fontSize: 11, 
    marginTop: 8,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

