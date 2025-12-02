import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert, Animated, TouchableOpacity } from 'react-native';
import { Card, Title, Text, Button, TextInput, Modal, Portal, Switch, FAB, Chip, IconButton, Surface } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { expenseAPI, aiAPI, userAPI } from '../services/api';
import { theme, commonStyles } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 40;

export default function DashboardScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [chartType, setChartType] = useState('line');
  const [selectedPeriod, setSelectedPeriod] = useState('4months');
  const [fabOpen, setFabOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDashboardData();
    loadProfile();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await expenseAPI.getDashboardStats();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setRefreshing(false);
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
      Alert.alert('Error', 'Failed to get AI response');
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

  const pieData = dashboardData ? [
    {
      name: 'Food',
      population: dashboardData.categories?.food || 0,
      color: '#FF6384',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Transport',
      population: dashboardData.categories?.transport || 0,
      color: '#36A2EB',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Shopping',
      population: dashboardData.categories?.shopping || 0,
      color: '#FFCE56',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Bills',
      population: dashboardData.categories?.bills || 0,
      color: '#4BC0C0',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Entertainment',
      population: dashboardData.categories?.entertainment || 0,
      color: '#9966FF',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ] : [];

  const totalExpenses = dashboardData?.months?.reduce((sum, month) => sum + month.debit, 0) || 0;
  const totalIncome = dashboardData?.months?.reduce((sum, month) => sum + month.credit, 0) || 0;
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome * 100).toFixed(1) : 0;

  return (
    <Animated.View style={[commonStyles.container, { opacity: fadeAnim, padding: 0 }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with gradient background */}
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Title style={styles.headerTitle}>Welcome Back!</Title>
                <Text style={styles.headerSubtitle}>{user?.full_name || 'User'}</Text>
              </View>
              <View style={styles.headerButtons}>
                <IconButton
                  icon="account-circle"
                  size={28}
                  iconColor="#FFFFFF"
                  onPress={() => setProfileVisible(true)}
                />
                <IconButton
                  icon="logout"
                  size={28}
                  iconColor="#FFFFFF"
                  onPress={logout}
                />
              </View>
            </View>
            
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <Surface style={styles.summaryCard}>
                <View style={styles.summaryContent}>
                  <Icon name="cash-multiple" size={24} color="#4CAF50" />
                  <View style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Income</Text>
                    <Text style={styles.summaryValue}>${totalIncome.toFixed(2)}</Text>
                  </View>
                </View>
              </Surface>
              
              <Surface style={styles.summaryCard}>
                <View style={styles.summaryContent}>
                  <Icon name="credit-card" size={24} color="#F44336" />
                  <View style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Expenses</Text>
                    <Text style={styles.summaryValue}>${totalExpenses.toFixed(2)}</Text>
                  </View>
                </View>
              </Surface>
              
              <Surface style={styles.summaryCard}>
                <View style={styles.summaryContent}>
                  <Icon name="piggy-bank" size={24} color="#2196F3" />
                  <View style={styles.summaryText}>
                    <Text style={styles.summaryLabel}>Savings</Text>
                    <Text style={styles.summaryValue}>${savings.toFixed(2)}</Text>
                  </View>
                </View>
              </Surface>
            </View>
          </View>
        </View>

        {/* Chart Section */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <View style={styles.chartHeader}>
              <Title style={styles.chartTitle}>Financial Overview</Title>
              <View style={styles.chartControls}>
                <Chip
                  selected={chartType === 'line'}
                  onPress={() => setChartType('line')}
                  style={styles.chartChip}
                  textStyle={styles.chipText}
                >
                  Line
                </Chip>
                <Chip
                  selected={chartType === 'bar'}
                  onPress={() => setChartType('bar')}
                  style={styles.chartChip}
                  textStyle={styles.chipText}
                >
                  Bar
                </Chip>
                <Chip
                  selected={chartType === 'pie'}
                  onPress={() => setChartType('pie')}
                  style={styles.chartChip}
                  textStyle={styles.chipText}
                >
                  Pie
                </Chip>
              </View>
            </View>
            
            <View style={styles.periodSelector}>
              <Chip
                selected={selectedPeriod === '1month'}
                onPress={() => setSelectedPeriod('1month')}
                style={styles.periodChip}
                textStyle={styles.chipText}
              >
                1 Month
              </Chip>
              <Chip
                selected={selectedPeriod === '4months'}
                onPress={() => setSelectedPeriod('4months')}
                style={styles.periodChip}
                textStyle={styles.chipText}
              >
                4 Months
              </Chip>
              <Chip
                selected={selectedPeriod === '1year'}
                onPress={() => setSelectedPeriod('1year')}
                style={styles.periodChip}
                textStyle={styles.chipText}
              >
                1 Year
              </Chip>
            </View>
            
            <View style={styles.chartContainer}>
              {chartType === 'line' && chartData && (
                <LineChart
                  data={chartData}
                  width={chartWidth}
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
              )}
              
              {chartType === 'bar' && chartData && (
                <BarChart
                  data={chartData}
                  width={chartWidth}
                  height={240}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                  }}
                  style={styles.chart}
                  onDataPointClick={(data) => {
                    Alert.alert(
                      'Month Details',
                      `${chartData.labels[data.index]}: $${data.value.toFixed(2)}`
                    );
                  }}
                />
              )}
              
              {chartType === 'pie' && (
                <PieChart
                  data={pieData}
                  width={chartWidth}
                  height={240}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
              )}
            </View>
            
            <View style={styles.savingsRateContainer}>
              <Text style={styles.savingsRateLabel}>Savings Rate</Text>
              <View style={styles.savingsRateBar}>
                <View 
                  style={[
                    styles.savingsRateFill, 
                    { width: `${Math.min(savingsRate, 100)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.savingsRateValue}>{savingsRate}%</Text>
            </View>
          </Card.Content>
        </Card>

        {/* AI Chat */}
        <Card style={styles.aiCard}>
          <Card.Content>
            <View style={styles.aiHeader}>
              <Icon name="robot" size={24} color={theme.colors.primary} />
              <Title style={styles.aiTitle}>AI Financial Assistant</Title>
            </View>
            <View style={styles.aiContainer}>
              <TextInput
                label="Ask about your finances..."
                value={aiQuery}
                onChangeText={setAiQuery}
                mode="outlined"
                multiline
                style={styles.aiInput}
                right={
                  <TextInput.Icon
                    icon="send"
                    onPress={handleAIQuery}
                    disabled={!aiQuery.trim() || loading}
                  />
                }
              />
            </View>
            {aiResponse ? (
              <Surface style={styles.responseCard}>
                <Text style={styles.responseText}>{aiResponse}</Text>
              </Surface>
            ) : (
              <View style={styles.aiSuggestions}>
                <Text style={styles.suggestionTitle}>Try asking:</Text>
                <View style={styles.suggestionChips}>
                  <Chip 
                    onPress={() => setAiQuery("How much did I spend on food last month?")}
                    style={styles.suggestionChip}
                  >
                    Food expenses
                  </Chip>
                  <Chip 
                    onPress={() => setAiQuery("What's my biggest expense category?")}
                    style={styles.suggestionChip}
                  >
                    Biggest expense
                  </Chip>
                  <Chip 
                    onPress={() => setAiQuery("How can I save more money?")}
                    style={styles.suggestionChip}
                  >
                    Saving tips
                  </Chip>
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title style={styles.actionsTitle}>Quick Actions</Title>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('AddExpense')}
              >
                <View style={[styles.actionButtonGradient, { backgroundColor: '#4CAF50' }]}>
                  <Icon name="plus-circle" size={28} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Add Expense</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Reports')}
              >
                <View style={[styles.actionButtonGradient, { backgroundColor: '#2196F3' }]}>
                  <Icon name="chart-line" size={28} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>View Reports</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Budget')}
              >
                <View style={[styles.actionButtonGradient, { backgroundColor: '#FF9800' }]}>
                  <Icon name="wallet" size={28} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Budget</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Goals')}
              >
                <View style={[styles.actionButtonGradient, { backgroundColor: '#9C27B0' }]}>
                  <Icon name="target" size={28} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Goals</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* FAB */}
      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'camera',
            label: 'Scan Receipt',
            onPress: () => navigation.navigate('ScanReceipt'),
          },
          {
            icon: 'calendar',
            label: 'View Calendar',
            onPress: () => navigation.navigate('Calendar'),
          },
          {
            icon: 'chart-pie',
            label: 'Analytics',
            onPress: () => navigation.navigate('Analytics'),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        onPress={() => {
          if (fabOpen) {
            // do something if the speed dial is open
          }
        }}
        style={styles.fab}
      />

      {/* Profile Modal */}
      <Portal>
        <Modal visible={profileVisible} onDismiss={() => setProfileVisible(false)} contentContainerStyle={styles.modal}>
          <Card style={styles.modalCard}>
            <Card.Content>
              <View style={styles.modalHeader}>
                <Icon name="account-circle" size={40} color={theme.colors.primary} />
                <Title style={styles.modalTitle}>Profile Settings</Title>
              </View>
              
              <TextInput
                label="Full Name"
                value={profileData.full_name || ''}
                onChangeText={(text) => setProfileData({...profileData, full_name: text})}
                mode="outlined"
                style={styles.modalInput}
                left={<TextInput.Icon icon="account" />}
              />
              
              <TextInput
                label="Monthly Salary"
                value={profileData.monthly_salary?.toString() || ''}
                onChangeText={(text) => setProfileData({...profileData, monthly_salary: parseFloat(text) || 0})}
                mode="outlined"
                keyboardType="numeric"
                style={styles.modalInput}
                left={<TextInput.Icon icon="cash" />}
              />
              
              <TextInput
                label="Location"
                value={profileData.location || ''}
                onChangeText={(text) => setProfileData({...profileData, location: text})}
                mode="outlined"
                style={styles.modalInput}
                left={<TextInput.Icon icon="map-marker" />}
              />
              
              <TextInput
                label="Mobile Number"
                value={profileData.mobile_number || ''}
                onChangeText={(text) => setProfileData({...profileData, mobile_number: text})}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.modalInput}
                left={<TextInput.Icon icon="phone" />}
              />
              
              <TextInput
                label="Currency"
                value={profileData.currency || 'USD'}
                onChangeText={(text) => setProfileData({...profileData, currency: text})}
                mode="outlined"
                style={styles.modalInput}
                left={<TextInput.Icon icon="currency-usd" />}
              />
              
              <TextInput
                label="Daily Reminder Time (HH:MM)"
                value={profileData.daily_reminder_time || '09:00'}
                onChangeText={(text) => setProfileData({...profileData, daily_reminder_time: text})}
                mode="outlined"
                style={styles.modalInput}
                placeholder="09:00"
                left={<TextInput.Icon icon="clock" />}
              />
              
              <View style={styles.switchContainer}>
                <View style={styles.switchContent}>
                  <Icon name="email" size={24} color={theme.colors.primary} />
                  <Text style={styles.switchLabel}>Monthly Report Email</Text>
                </View>
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
                  icon="close"
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={updateProfile} 
                  style={styles.modalButton}
                  icon="content-save"
                >
                  Save
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 0,
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: theme.colors.primary,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryCard: {
    width: '31%',
    borderRadius: 12,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  summaryContent: {
    padding: 12,
    alignItems: 'center',
  },
  summaryText: {
    alignItems: 'center',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chartCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  chartControls: {
    flexDirection: 'row',
  },
  chartChip: {
    marginLeft: 6,
    backgroundColor: '#F0F0F0',
  },
  chipText: {
    fontSize: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  periodChip: {
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  savingsRateContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  savingsRateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  savingsRateBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  savingsRateFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  savingsRateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'right',
    marginTop: 4,
  },
  aiCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#F8F9FA',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  aiContainer: {
    marginBottom: 10,
  },
  aiInput: {
    backgroundColor: '#FFFFFF',
  },
  responseCard: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
    elevation: 2,
  },
  responseText: {
    lineHeight: 20,
  },
  aiSuggestions: {
    marginTop: 15,
  },
  suggestionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#E0E0E0',
  },
  actionsCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 80,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 8,
  },
  fab: {
    marginBottom: 60,
  },
  modal: {
    backgroundColor: 'white',
    padding: 0,
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalCard: {
    borderRadius: 16,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 8,
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
    marginBottom: 16,
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
  switchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
});