import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Title, Card, Switch, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { theme, commonStyles } from '../utils/theme';

export default function ProfileSetupScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    monthly_salary: '',
    location: '',
    mobile_number: '',
    monthly_income: '',
    currency: 'INR',
    monthly_cycle_start: 1,
    monthly_report_enabled: true,
    daily_reminder_time: '09:00',
  });

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.monthly_salary || !formData.location) {
      alert('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      await userAPI.updateProfile({
        ...formData,
        monthly_salary: parseFloat(formData.monthly_salary),
        monthly_income: parseFloat(formData.monthly_income || formData.monthly_salary),
      });
      updateUser({ is_profile_complete: true });
      navigation.replace('Dashboard');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Card style={[commonStyles.card, styles.headerCard]}>
          <Card.Content>
            <Title style={styles.headerTitle}>Complete Your Profile</Title>
            <Text style={styles.headerSubtitle}>Set up your financial preferences</Text>
          </Card.Content>
        </Card>

        <Card style={commonStyles.card}>
          <Card.Content>
            <Title style={commonStyles.subtitle}>Personal Information</Title>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                mode="outlined"
                style={styles.input}
                placeholder="Enter your full name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                mode="outlined"
                style={styles.input}
                placeholder="Enter your location"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                value={formData.mobile_number}
                onChangeText={(text) => setFormData({ ...formData, mobile_number: text })}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                placeholder="Enter your mobile number"
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={commonStyles.card}>
          <Card.Content>
            <Title style={commonStyles.subtitle}>Financial Information</Title>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monthly Salary *</Text>
              <TextInput
                value={formData.monthly_salary}
                onChangeText={(text) => setFormData({ ...formData, monthly_salary: text })}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                placeholder="Enter your monthly salary"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Monthly Income</Text>
              <TextInput
                value={formData.monthly_income}
                onChangeText={(text) => setFormData({ ...formData, monthly_income: text })}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                placeholder="Enter your monthly income"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Currency</Text>
              <TextInput
                value={formData.currency}
                onChangeText={(text) => setFormData({ ...formData, currency: text })}
                mode="outlined"
                style={styles.input}
                placeholder="USD, EUR, INR, etc."
              />
            </View>
          </Card.Content>
        </Card>

        <Card style={commonStyles.card}>
          <Card.Content>
            <Title style={commonStyles.subtitle}>Preferences</Title>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Monthly Report Email</Text>
              <Switch
                value={formData.monthly_report_enabled}
                onValueChange={(value) => setFormData({ ...formData, monthly_report_enabled: value })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Daily Reminder Time (HH:MM)</Text>
              <TextInput
                value={formData.daily_reminder_time}
                onChangeText={(text) => setFormData({ ...formData, daily_reminder_time: text })}
                mode="outlined"
                placeholder="09:00"
                style={styles.input}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
              contentStyle={styles.buttonContent}
            >
              Complete Setup
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: theme.colors.primary,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  inputContainer: {
    marginBottom: 16,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
