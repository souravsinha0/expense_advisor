import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Switch, Text, Surface, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* ===== Progress Header ===== */}
        <Surface style={styles.headerCard} elevation={2}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerSubtitle}>Setup Wizard</Text>
              <Text style={styles.headerTitle}>Complete Your Profile</Text>
            </View>
            <View style={styles.progressBadge}>
              <MaterialCommunityIcons name="check-circle" size={32} color="#4CAF50" />
            </View>
          </View>
          <Text style={styles.headerDescription}>Configure your financial preferences to get started</Text>
        </Surface>

        {/* ===== Personal Information ===== */}
        <Surface style={styles.card} elevation={2}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="account" size={18} color="#1976D2" />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>
          <Divider style={styles.sectionDivider} />

          <View style={styles.sectionContent}>
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Full Name *</Text>
              <TextInput
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                mode="outlined"
                style={styles.input}
                placeholder="Enter your full name"
                left={<TextInput.Icon icon="account-outline" />}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Location *</Text>
              <TextInput
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                mode="outlined"
                style={styles.input}
                placeholder="City, Country"
                left={<TextInput.Icon icon="map-marker-outline" />}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <TextInput
                value={formData.mobile_number}
                onChangeText={(text) => setFormData({ ...formData, mobile_number: text })}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                placeholder="+1 (555) 000-0000"
                left={<TextInput.Icon icon="phone-outline" />}
              />
            </View>
          </View>
        </Surface>

        {/* ===== Financial Information ===== */}
        <Surface style={styles.card} elevation={2}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="wallet" size={18} color="#1976D2" />
            <Text style={styles.sectionTitle}>Financial Information</Text>
          </View>
          <Divider style={styles.sectionDivider} />

          <View style={styles.sectionContent}>
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Monthly Salary *</Text>
              <TextInput
                value={formData.monthly_salary}
                onChangeText={(text) => setFormData({ ...formData, monthly_salary: text })}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                placeholder="0.00"
                left={<TextInput.Icon icon="currency-inr" />}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Monthly Income</Text>
              <TextInput
                value={formData.monthly_income}
                onChangeText={(text) => setFormData({ ...formData, monthly_income: text })}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
                placeholder="Leave blank if same as salary"
                left={<TextInput.Icon icon="cash" />}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Currency</Text>
              <TextInput
                value={formData.currency}
                onChangeText={(text) => setFormData({ ...formData, currency: text })}
                mode="outlined"
                style={styles.input}
                placeholder="USD, EUR, INR, etc."
                left={<TextInput.Icon icon="currency-usd" />}
              />
            </View>
          </View>
        </Surface>

        {/* ===== Preferences ===== */}
        <Surface style={styles.card} elevation={2}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cog" size={18} color="#1976D2" />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          <Divider style={styles.sectionDivider} />

          <View style={styles.sectionContent}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <MaterialCommunityIcons name="email" size={16} color="#1976D2" />
                <View style={styles.switchText}>
                  <Text style={styles.switchLabel}>Monthly Report Email</Text>
                  <Text style={styles.switchDescription}>Get financial summary monthly</Text>
                </View>
              </View>
              <Switch
                value={formData.monthly_report_enabled}
                onValueChange={(value) => setFormData({ ...formData, monthly_report_enabled: value })}
              />
            </View>

            <Divider style={styles.switchDivider} />

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Daily Reminder Time</Text>
              <TextInput
                value={formData.daily_reminder_time}
                onChangeText={(text) => setFormData({ ...formData, daily_reminder_time: text })}
                mode="outlined"
                placeholder="09:00"
                style={styles.input}
                left={<TextInput.Icon icon="clock-outline" />}
              />
            </View>
          </View>
        </Surface>

        {/* ===== Submit Button ===== */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
          labelStyle={styles.submitLabel}
        >
          <MaterialCommunityIcons name="check" size={18} color="#fff" /> Complete Setup
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  /* ===== HEADER ===== */
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerDescription: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    lineHeight: 18,
  },
  progressBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },

  /* ===== CARD STYLES ===== */
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.15)',
    marginBottom: 16,
    overflow: 'hidden',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionDivider: {
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  /* ===== FORM FIELDS ===== */
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1976D2',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fafafa',
    fontSize: 14,
    height: 48,
  },

  /* ===== SWITCH STYLES ===== */
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  switchText: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  switchDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  switchDivider: {
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
    marginVertical: 12,
  },

  /* ===== SUBMIT BUTTON ===== */
  submitButton: {
    backgroundColor: '#1976D2',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
