import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { TextInput, Button, Text, Surface, Divider } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.background}>
        <View style={styles.topDecoration} />
        <View style={styles.content}>
          <Surface style={styles.card} elevation={2}>
            <View style={styles.cardContent}>
              {/* Header Section */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoBg}>
                    <MaterialIcons name="account_balance_wallet" size={36} color="#fff" />
                  </View>
                </View>
                <Text style={styles.title}>Expense Advisor</Text>
                <Text style={styles.subtitle}>Your Personal Financial Assistant</Text>
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
                    placeholder="Enter your password"
                    left={<TextInput.Icon icon={() => <MaterialIcons name="lock-outline" size={18} color="#999" />} />}
                    outlineColor="#E8E8E8"
                    activeOutlineColor={theme.colors.primary}
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  icon={() => <MaterialIcons name="arrow-forward" size={20} color="#fff" />}
                >
                  Sign In
                </Button>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>New here?</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('signup')}
                  style={styles.signupButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.signupButtonLabel}
                  icon={() => <MaterialIcons name="person-add-alt" size={18} color={theme.colors.primary} />}
                >
                  Create Account
                </Button>
              </View>

              {/* Footer */}
              <Text style={styles.footer}>Secure • Fast • Reliable</Text>
            </View>
          </Surface>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  background: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  topDecoration: {
    height: 60,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    opacity: 0.08,
    marginBottom: 20,
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
  loginButton: {
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
  signupButton: {
    borderRadius: 8,
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    minHeight: 48,
  },
  signupButtonLabel: {
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