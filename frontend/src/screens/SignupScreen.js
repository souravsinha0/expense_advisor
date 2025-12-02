import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, Divider } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
      alert('Password must be at least 6 characters');
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Surface style={styles.card} elevation={2}>
            <View style={styles.cardContent}>
              {/* Header Section */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoBg}>
                    <MaterialIcons name="person-add" size={36} color="#fff" />
                  </View>
                </View>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join thousands of smart investors</Text>
              </View>

              {/* Form Section */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                    placeholder="name@example.com"
                    left={<TextInput.Icon icon={() => <MaterialIcons name="mail-outline" size={18} color="#999" />} />}
                    outlineColor="#E8E8E8"
                    activeOutlineColor={theme.colors.primary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    placeholder="Min. 6 characters"
                    left={<TextInput.Icon icon={() => <MaterialIcons name="lock-outline" size={18} color="#999" />} />}
                    outlineColor="#E8E8E8"
                    activeOutlineColor={theme.colors.primary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                    placeholder="Retype your password"
                    left={<TextInput.Icon icon={() => <MaterialIcons name="lock-check" size={18} color="#999" />} />}
                    outlineColor="#E8E8E8"
                    activeOutlineColor={theme.colors.primary}
                  />
                </View>

                <View style={styles.requirements}>
                  <View style={styles.requirementItem}>
                    <MaterialIcons name={password.length >= 6 ? 'check-circle' : 'radio-button-unchecked'} size={16} color={password.length >= 6 ? '#4CAF50' : '#DDD'} />
                    <Text style={styles.requirementText}>At least 6 characters</Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <MaterialIcons name={password === confirmPassword && confirmPassword ? 'check-circle' : 'radio-button-unchecked'} size={16} color={password === confirmPassword && confirmPassword ? '#4CAF50' : '#DDD'} />
                    <Text style={styles.requirementText}>Passwords match</Text>
                  </View>
                </View>

                <Button
                  mode="contained"
                  onPress={handleSignup}
                  loading={loading}
                  disabled={loading}
                  style={styles.signupButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  icon={() => <MaterialIcons name="arrow-forward" size={20} color="#fff" />}
                >
                  Create Account
                </Button>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Already have an account?</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('login')}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.loginButtonLabel}
                  icon={() => <MaterialIcons name="login" size={18} color={theme.colors.primary} />}
                >
                  Sign In
                </Button>
              </View>

              {/* Footer */}
              <Text style={styles.footer}>Secure • Privacy Protected • No Spam</Text>
            </View>
          </Surface>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 420,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8F9FB',
    fontSize: 14,
    borderRadius: 8,
    height: 44,
  },
  requirements: {
    gap: 8,
    backgroundColor: '#F8F9FB',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  signupButton: {
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    elevation: 2,
    minHeight: 48,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  dividerText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 8,
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    minHeight: 48,
  },
  loginButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  footer: {
    fontSize: 11,
    color: '#CCC',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});