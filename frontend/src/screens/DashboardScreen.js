import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Card, Title, Text, Button, TextInput, Modal, Portal, Switch } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { expenseAPI, aiAPI, userAPI } from '../services/api';
import { theme, commonStyles } from '../utils/theme';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [profileData, setProfileData] = useState({});

  useEffect(() => {
    loadDashboardData();
    loadProfile();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await expenseAPI.getDashboardStats();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfileData(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await aiAPI.chat({ message: aiQuery });
      setAiResponse(response.data.response);
      setAiQuery('');
    } catch (error) {
      console.error('AI query error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      await userAPI.updateProfile(profileData);
      updateUser(profileData);
      setProfileVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const chartData = dashboardData ? {
    labels: dashboardData.months.map(m => m.month.substring(0, 3)),
    datasets: [
      {
        data: dashboardData.months.map(m => m.credit),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 3,
      },
      {
        data: dashboardData.months.map(m => m.debit),
        color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
        strokeWidth: 3,
      },
    ],
    legend: ['Income', 'Expenses']
  } : null;

  return (
    <View style={[commonStyles.container, { padding: 0 }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={commonStyles.row}>
              <View>
                <Title style={styles.headerTitle}>Welcome Back!</Title>
                <Text style={styles.headerSubtitle}>{user?.full_name || 'User'}</Text>
              </View>
              <View style={styles.headerButtons}>
                <Button 
                  mode="contained" 
                  onPress={() => setProfileVisible(true)}
                  style={styles.headerButton}
                  labelStyle={styles.headerButtonText}
                  compact
                >
                  Profile
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={logout}
                  style={styles.logoutButton}
                  labelStyle={styles.logoutButtonText}
                  compact
                >
                  Logout
                </Button>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Chart */}
        {chartData && (
          <Card style={commonStyles.card}>
            <Card.Content>
              <Title style={commonStyles.subtitle}>Last 4 Months Overview</Title>
              <View style={styles.chartContainer}>
                <LineChart
                  data={chartData}
                  width={screenWidth - 80}
                  height={240}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: { borderRadius: 16 },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#FF9800"
                  }
                }}
                bezier
                style={styles.chart}
                withDots={true}
                onDataPointClick={(data) => {
                  Alert.alert(
                    'Month Details',
                    `${chartData.labels[data.index]}: $${data.value.toFixed(2)}`
                  );
                }}
                />
              </View>
            </Card.Content>
          </Card>
        )}

        {/* AI Chat */}
        <Card style={[commonStyles.card, styles.aiCard]}>
          <Card.Content>
            <Title style={commonStyles.subtitle}>Ask AI Assistant</Title>
            <View style={styles.aiContainer}>
              <TextInput
                label="Ask about your finances..."
                value={aiQuery}
                onChangeText={setAiQuery}
                mode="outlined"
                multiline
                style={styles.aiInput}
              />
              <Button
                mode="contained"
                onPress={handleAIQuery}
                loading={loading}
                style={styles.aiButton}
                disabled={!aiQuery.trim()}
              >
                Ask AI
              </Button>
            </View>
            {aiResponse ? (
              <Card style={styles.responseCard}>
                <Card.Content>
                  <Text style={styles.responseText}>{aiResponse}</Text>
                </Card.Content>
              </Card>
            ) : null}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={[commonStyles.card, styles.actionsCard]}>
          <Card.Content>
            <Title style={commonStyles.subtitle}>Quick Actions</Title>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Calendar')}
                style={styles.actionButton}
                icon="plus"
              >
                Add Expense
              </Button>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Reports')}
                style={styles.actionButton}
                icon="chart-line"
              >
                View Reports
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Profile Modal */}
      <Portal>
        <Modal visible={profileVisible} onDismiss={() => setProfileVisible(false)} contentContainerStyle={styles.modal}>
          <Card>
            <Card.Content>
              <Title style={styles.modalTitle}>Profile Settings</Title>
              <TextInput
                label="Full Name"
                value={profileData.full_name || ''}
                onChangeText={(text) => setProfileData({...profileData, full_name: text})}
                mode="outlined"
                style={styles.modalInput}
              />
              <TextInput
                label="Monthly Salary"
                value={profileData.monthly_salary?.toString() || ''}
                onChangeText={(text) => setProfileData({...profileData, monthly_salary: parseFloat(text) || 0})}
                mode="outlined"
                keyboardType="numeric"
                style={styles.modalInput}
              />
              <TextInput
                label="Location"
                value={profileData.location || ''}
                onChangeText={(text) => setProfileData({...profileData, location: text})}
                mode="outlined"
                style={styles.modalInput}
              />
              <TextInput
                label="Mobile Number"
                value={profileData.mobile_number || ''}
                onChangeText={(text) => setProfileData({...profileData, mobile_number: text})}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.modalInput}
              />
              <TextInput
                label="Currency"
                value={profileData.currency || 'USD'}
                onChangeText={(text) => setProfileData({...profileData, currency: text})}
                mode="outlined"
                style={styles.modalInput}
              />
              <TextInput
                label="Daily Reminder Time (HH:MM)"
                value={profileData.daily_reminder_time || '09:00'}
                onChangeText={(text) => setProfileData({...profileData, daily_reminder_time: text})}
                mode="outlined"
                style={styles.modalInput}
                placeholder="09:00"
              />
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Monthly Report Email</Text>
                <Switch
                  value={profileData.monthly_report_enabled || false}
                  onValueChange={(value) => setProfileData({...profileData, monthly_report_enabled: value})}
                />
              </View>
              <View style={styles.modalButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => setProfileVisible(false)} 
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={updateProfile} 
                  style={styles.modalButton}
                >
                  Save
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    backgroundColor: theme.colors.primary,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    minWidth: 80,
  },
  headerButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
  },
  logoutButton: {
    borderColor: '#FFFFFF',
    borderRadius: 6,
    minWidth: 80,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  aiCard: {
    backgroundColor: '#F8F9FA',
  },
  aiContainer: {
    marginBottom: 10,
  },
  aiInput: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  aiButton: {
    alignSelf: 'flex-end',
    minWidth: 100,
    borderRadius: 8,
  },
  responseCard: {
    marginTop: 15,
    backgroundColor: '#E8F5E8',
  },
  responseText: {
    lineHeight: 20,
  },
  actionsCard: {
    backgroundColor: '#FFF8E1',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});