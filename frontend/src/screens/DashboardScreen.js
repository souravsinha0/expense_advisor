import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert, TouchableOpacity } from 'react-native';
import {
  Surface, Text, Button, TextInput, Modal, Portal, Switch, Divider
} from 'react-native-paper';
import { AnimatedLineChart } from '../components/AnimatedChart';
import { useAuth } from '../context/AuthContext';
import { expenseAPI, aiAPI, userAPI } from '../services/api';
import { commonStyles } from '../utils/theme';

const { width: initialWindowWidth } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [profileData, setProfileData] = useState({});

  // Dynamic chart width - critical fix for mobile browser rendering
  const [chartWidth, setChartWidth] = useState(initialWindowWidth - 64);

  useEffect(() => {
    loadDashboardData();
    loadProfile();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await expenseAPI.getDashboardStats();
      setDashboardData(res.data);
    } catch (err) { console.error(err); }
  };

  const loadProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfileData(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    setLoading(true);
    try {
      const res = await aiAPI.chat({ message: aiQuery });
      setAiResponse(res.data.response);
      setAiQuery('');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateProfile = async () => {
    try {
      await userAPI.updateProfile(profileData);
      updateUser(profileData);
      setProfileVisible(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const chartData = dashboardData ? {
    labels: dashboardData.months.map(m => m.month.substring(0, 3)),
    datasets: [
      {
        data: dashboardData.months.map(m => m.credit || 0),
        color: () => '#10b981',
        strokeWidth: 4,
      },
      {
        data: dashboardData.months.map(m => m.debit || 0),
        color: () => '#ef4444',
        strokeWidth: 4,
      }
    ],
    legend: ['Income', 'Expenses']
  } : null;

  return (
    <View style={commonStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

        {/* Elegant Header */}
        <Surface style={styles.headerCard} elevation={6}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
              <Text style={styles.subtitle}>Your financial overview</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setProfileVisible(true)}>
                <Text style={styles.icon}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={logout}>
                <Text style={styles.icon}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Surface>

        {/* Chart Card - Fixed for mobile browser */}
        {chartData && (
          <Surface style={styles.chartCard} elevation={6}>
            <Text style={styles.chartTitle}>Income vs Expenses (Last 4 Months)</Text>

            {/* Wrapper to measure actual available width */}
            <View 
              style={styles.chartWrapper}
              onLayout={(event) => {
                const { width } = event.nativeEvent.layout;
                setChartWidth(width - 32); // subtract padding for better fit
              }}
            >
              <View style={styles.chartContainer}>
                <AnimatedLineChart
                  data={chartData}
                  width={chartWidth}
                  height={220}
                  chartConfig={{
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: () => '#64748b',
                    labelColor: () => '#94a3b8',
                    propsForDots: { r: "4", strokeWidth: "2", stroke: "#fff" },
                    fillShadowGradient: '#3b82f6',
                    fillShadowGradientOpacity: 0.15,
                    propsForLabels: { fontSize: 11 },
                    propsForBackgroundLines: { strokeWidth: 1 },
                  }}
                  bezier
                  withDots
                  fromZero
                  yAxisLabel="₹ "
                  style={{ borderRadius: 12 }}
                />
              </View>
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
                <Text style={styles.legendText}>Income</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendText}>Expenses</Text>
              </View>
            </View>
          </Surface>
        )}

        {/* AI Assistant */}
        <Surface style={styles.aiCard} elevation={6}>
          <Text style={styles.aiTitle}>AI Financial Assistant</Text>
          <View style={styles.inputRow}>
            <TextInput
              mode="outlined"
              placeholder="Ask about your spending..."
              value={aiQuery}
              onChangeText={setAiQuery}
              style={styles.input}
              outlineStyle={{ borderRadius: 16 }}
              theme={{ roundness: 16 }}
            />
            <Button
              mode="contained"
              onPress={handleAIQuery}
              loading={loading}
              disabled={!aiQuery.trim()}
              contentStyle={{ height: 52 }}
              style={styles.sendBtn}
            >
              Send
            </Button>
          </View>

          {aiResponse && (
            <View style={styles.bubble}>
              <Text style={styles.bubbleTitle}>AI Response</Text>
              <Text style={styles.bubbleText}>{aiResponse}</Text>
            </View>
          )}
        </Surface>

      </ScrollView>

      {/* Profile Modal */}
      <Portal>
        <Modal visible={profileVisible} onDismiss={() => setProfileVisible(false)} contentContainerStyle={styles.modalOverlay}>
          <Surface style={styles.modal} elevation={10}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Settings</Text>
              <TouchableOpacity onPress={() => setProfileVisible(false)}>
                <Text style={styles.closeIcon}>×</Text>
              </TouchableOpacity>
            </View>
            <Divider />

            <ScrollView style={styles.modalBody}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                <TextInput label="Full Name" value={profileData.full_name || ''} onChangeText={t => setProfileData(p => ({ ...p, full_name: t }))} mode="outlined" style={styles.field} />
                <TextInput label="Mobile" value={profileData.mobile_number || ''} onChangeText={t => setProfileData(p => ({ ...p, mobile_number: t }))} mode="outlined" style={styles.field} keyboardType="phone-pad" />
                <TextInput label="Location" value={profileData.location || ''} onChangeText={t => setProfileData(p => ({ ...p, location: t }))} mode="outlined" style={styles.field} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Financial Settings</Text>
                <TextInput label="Monthly Salary" value={profileData.monthly_salary?.toString() || ''} onChangeText={t => setProfileData(p => ({ ...p, monthly_salary: parseFloat(t) || 0 }))} mode="outlined" style={styles.field} keyboardType="numeric" />
                <TextInput label="Currency" value={profileData.currency || 'USD'} onChangeText={t => setProfileData(p => ({ ...p, currency: t }))} mode="outlined" style={styles.field} />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <TextInput label="Daily Reminder Time" value={profileData.daily_reminder_time || '09:00'} onChangeText={t => setProfileData(p => ({ ...p, daily_reminder_time: t }))} mode="outlined" style={styles.field} />
                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.switchLabel}>Monthly Report Email</Text>
                    <Text style={styles.switchDesc}>Receive monthly summary</Text>
                  </View>
                  <Switch value={profileData.monthly_report_enabled || false} onValueChange={v => setProfileData(p => ({ ...p, monthly_report_enabled: v }))} />
                </View>
              </View>

              <View style={styles.buttons}>
                <Button mode="outlined" onPress={() => setProfileVisible(false)} style={styles.btn}>Cancel</Button>
                <Button mode="contained" onPress={updateProfile} style={styles.btn}>Save Changes</Button>
              </View>
            </ScrollView>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },

  // Header
  headerCard: { backgroundColor: '#204ea8fb', borderRadius: 20, padding: 22, marginBottom: 20 },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12
  },
  greeting: { fontSize: 15, color: '#e0e7ff', fontWeight: '500' },
  userName: { fontSize: 26, color: 'white', fontWeight: 'bold', marginVertical: 4 },
  subtitle: { fontSize: 14, color: '#c7d2fe' },
  actions: { 
    flexDirection: 'row', 
    gap: 8,
    flexShrink: 0,
    minWidth: 120
  },
  iconBtn: { 
    backgroundColor: 'rgba(255,255,255,0.18)', 
    paddingHorizontal: 8, 
    paddingVertical: 6, 
    borderRadius: 12,
    minWidth: 50
  },
  icon: { fontSize: 11, color: 'white', fontWeight: '600' },

  // Chart Card
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  chartTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', textAlign: 'center', marginBottom: 12 },

  chartWrapper: {
    width: '100%',
    marginBottom: 12,
  },

  chartContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  legend: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 14, color: '#64748b', fontWeight: '600' },

  // AI Card
  aiCard: { backgroundColor: 'white', borderRadius: 20, padding: 20, marginBottom: 20 },
  aiTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f8fafc' },
  sendBtn: { borderRadius: 16 },
  bubble: { marginTop: 20, backgroundColor: '#eef2ff', padding: 16, borderRadius: 16, borderLeftWidth: 5, borderLeftColor: '#6366f1' },
  bubbleTitle: { fontSize: 14, fontWeight: 'bold', color: '#4f46e5', marginBottom: 8 },
  bubbleText: { fontSize: 15, color: '#1e293b', lineHeight: 22 },

  // Modal
  modalOverlay: { padding: 20, justifyContent: 'center' },
  modal: { backgroundColor: 'white', borderRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  closeIcon: { fontSize: 28, color: '#64748b' },
  modalBody: { paddingHorizontal: 20, paddingBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#6366f1', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  field: { marginBottom: 12, backgroundColor: '#f8fafc' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f0f9ff', borderRadius: 12, marginTop: 8 },
  switchLabel: { fontSize: 15, fontWeight: '600' },
  switchDesc: { fontSize: 13, color: '#64748b' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: { flex: 1, borderRadius: 14, paddingVertical: 4 },
});