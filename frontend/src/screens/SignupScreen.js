import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, Card, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSignup = async () => {
    console.log('Signup button pressed');
    
    if (!email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      console.log('Password validation failed:', password.length);
      alert(
        'Password must be at least 6 characters',
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
        { cancelable: false }
      );
      return;
    }

    setLoading(true);
    try {
      console.log('Calling signup with:', { email, password });
      const result = await signup(email, password);
      console.log('Signup result:', result);
      
      if (!result.success) {
        alert('Signup Failed', result.error);
      }
      // Don't navigate manually - AuthContext will handle navigation
    } catch (error) {
      console.error('Signup error:', error);
      alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.header}>
              <Title style={styles.title}>Create Account</Title>
              <Text style={styles.subtitle}>Join Expense Advisor today</Text>
            </View>
            
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  placeholder="Enter your email"
                  left={<TextInput.Icon icon="email" />}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                  placeholder="Enter your password"
                  left={<TextInput.Icon icon="lock" />}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="outlined"
                  secureTextEntry
                  style={styles.input}
                  placeholder="Confirm your password"
                  left={<TextInput.Icon icon="lock-check" />}
                />
              </View>
              
              <Button
                mode="contained"
                onPress={handleSignup}
                loading={loading}
                style={styles.signupButton}
                contentStyle={styles.buttonContent}
              >
                Create Account
              </Button>
              
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.linkButton}
              >
                Already have an account? Sign In
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FAFAFA',
  },
  signupButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 16,
  },
});