import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Title, TextInput, Button, SegmentedButtons, Text, Chip, Surface, Divider, Portal } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { expenseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { theme, commonStyles } from '../utils/theme';

const { width: windowWidth } = Dimensions.get('window');

export default function CalendarScreen({ navigation }) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [dayExpenses, setDayExpenses] = useState([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [viewMode, setViewMode] = useState('day'); // 'day' or 'month'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newExpense, setNewExpense] = useState({
    details: '',
    amount: '',
    transaction_type: 'debit'
  });
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({ details: '', amount: '', transaction_type: 'debit' });
  const [dailyTotal, setDailyTotal] = useState({ credit: 0, debit: 0, net: 0 });
  const [monthlyTotal, setMonthlyTotal] = useState({ credit: 0, debit: 0, net: 0 });

  const months = [
    { label: 'January', value: 1 }, { label: 'February', value: 2 }, { label: 'March', value: 3 },
    { label: 'April', value: 4 }, { label: 'May', value: 5 }, { label: 'June', value: 6 },
    { label: 'July', value: 7 }, { label: 'August', value: 8 }, { label: 'September', value: 9 },
    { label: 'October', value: 10 }, { label: 'November', value: 11 }, { label: 'December', value: 12 }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    if (viewMode === 'month') {
      loadMonthlyExpenses();
    }
  }, [selectedMonth, selectedYear, viewMode]);

  const handleDateSelect = async (day) => {
    setSelectedDate(day.dateString);
    setViewMode('day');
    
    try {
      const response = await expenseAPI.getExpenses(
        new Date(day.dateString).getFullYear(),
        new Date(day.dateString).getMonth() + 1
      );
      
      const dateExpenses = response.data.filter(expense => 
        expense.transaction_date.startsWith(day.dateString)
      );
      setDayExpenses(dateExpenses);
      
      const dayCredit = dateExpenses.filter(e => e.transaction_type === 'credit').reduce((sum, e) => sum + e.amount, 0);
      const dayDebit = dateExpenses.filter(e => e.transaction_type === 'debit').reduce((sum, e) => sum + e.amount, 0);
      setDailyTotal({ credit: dayCredit, debit: dayDebit, net: dayCredit - dayDebit });
    } catch (error) {
      console.error('Error loading day expenses:', error);
    }
  };

  const loadMonthlyExpenses = async () => {
    try {
      const response = await expenseAPI.getExpenses(selectedYear, selectedMonth);
      setMonthlyExpenses(response.data);
      
      const monthCredit = response.data.filter(e => e.transaction_type === 'credit').reduce((sum, e) => sum + e.amount, 0);
      const monthDebit = response.data.filter(e => e.transaction_type === 'debit').reduce((sum, e) => sum + e.amount, 0);
      setMonthlyTotal({ credit: monthCredit, debit: monthDebit, net: monthCredit - monthDebit });
    } catch (error) {
      console.error('Error loading monthly expenses:', error);
    }
  };

  const handleAddExpense = async () => {
    if (!selectedDate || !newExpense.details || !newExpense.amount) {
      Alert.alert('Error', 'Please fill in all fields and select a date');
      return;
    }

    setLoading(true);
    try {
      await expenseAPI.create({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        transaction_date: new Date(selectedDate).toISOString()
      });
      
      setNewExpense({ details: '', amount: '', transaction_type: 'debit' });
      alert('Expense added successfully');
      handleDateSelect({ dateString: selectedDate });
    } catch (error) {
      Alert.alert('Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      details: expense.details,
      amount: expense.amount.toString(),
      transaction_type: expense.transaction_type
    });
    setEditModalVisible(true);
  };

  const handleUpdateExpense = async () => {
    if (!editForm.details || !editForm.amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await expenseAPI.update(editingExpense.id, {
        ...editForm,
        amount: parseFloat(editForm.amount),
        transaction_date: editingExpense.transaction_date
      });
      
      setEditModalVisible(false);
      Alert.alert('Success', 'Expense updated successfully');
      
      if (selectedDate) {
        handleDateSelect({ dateString: selectedDate });
      } else {
        loadMonthlyExpenses();
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseAPI.delete(expenseId);
        alert('Expense deleted successfully');
        
        if (viewMode === 'day' && selectedDate) {
          handleDateSelect({ dateString: selectedDate });
        } else {
          loadMonthlyExpenses();
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete expense');
      }
    }
  };

  const renderExpenseItem = (expenses = []) => {
    if (!Array.isArray(expenses)) return null;

    const sorted = [...expenses].sort(
      (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
    );

    return sorted.map((expense) => (
      <Surface key={`${expense.id}-${expense.transaction_date}`} style={styles.expenseCard} elevation={2}>
        <View style={styles.expenseContent}>
          <View style={[
            styles.typeIndicator,
            { backgroundColor: expense.transaction_type === 'credit' ? theme.colors.income : theme.colors.expense }
          ]} />
          
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseDetails}>{expense.details}</Text>
            <Text style={styles.expenseDate}>
              {new Date(expense.transaction_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short', 
                day: 'numeric'
              })}
            </Text>
          </View>

          <View style={styles.expenseActions}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountSymbol}>
                {expense.transaction_type === 'credit' ? 'Income' : 'Expense'}
              </Text>
              <Text style={[
                styles.expenseAmount,
                {
                  color: expense.transaction_type === 'credit' ? theme.colors.income : theme.colors.expense,
                },
              ]}>
                {expense.transaction_type === 'credit' ? '+' : '-'}
                ₹{expense.amount}
              </Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => handleEditExpense(expense)}
              >
                <Text style={styles.editIcon}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteExpense(expense.id)}
              >
                <Text style={styles.deleteIcon}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Surface>
    ));
  };

  const isLargeScreen = windowWidth > 900;

  return (
    <View style={commonStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header with Tabs */}
        <Surface style={styles.headerCard} elevation={2}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerSubtitle}>Expense Management</Text>
            <Text style={styles.headerTitle}>Calendar & Entries</Text>
          </View>
          <View style={styles.tabsContainer}>
            <SegmentedButtons
              value={viewMode}
              onValueChange={setViewMode}
              buttons={[
                { value: 'day', label: 'Daily' },
                { value: 'month', label: 'Monthly' }
              ]}
              style={styles.segmentedButtons}
              density="medium"
            />
          </View>
        </Surface>

        {/* Main Content Grid */}
        <View style={[styles.contentGrid, isLargeScreen && styles.contentGridRow]}>
          
          {/* Calendar Card */}
          <Surface style={[styles.calendarCard, isLargeScreen && styles.calendarCardLarge]} elevation={2}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-month" size={18} color="#1976D2" />
              <Text style={styles.cardTitle}>Select Date</Text>
            </View>
            <Divider style={styles.cardDivider} />
            <View style={styles.calendarWrapper}>
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={{
                  [selectedDate]: { 
                    selected: true, 
                    selectedColor: '#1976D2',
                    selectedTextColor: '#FFFFFF'
                  }
                }}
                theme={{
                  backgroundColor: '#fff',
                  calendarBackground: '#fff',
                  textSectionTitleColor: '#1976D2',
                  selectedDayBackgroundColor: '#1976D2',
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: '#1976D2',
                  dayTextColor: '#333',
                  textDisabledColor: '#ccc',
                  dotColor: '#1976D2',
                  selectedDotColor: '#FFFFFF',
                  arrowColor: '#1976D2',
                  monthTextColor: '#1976D2',
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13
                }}
              />
            </View>
          </Surface>

          {/* Add Entry Form */}
          {selectedDate && (
            <Surface style={[styles.formCard, isLargeScreen && styles.formCardLarge]} elevation={2}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="plus-circle" size={18} color="#4CAF50" />
                <Text style={styles.cardTitle}>Add Entry</Text>
              </View>
              <Divider style={styles.cardDivider} />
              
              <View style={styles.formContent}>
                <View style={styles.dateSelection}>
                  <MaterialCommunityIcons name="calendar-check" size={16} color="#1976D2" />
                  <View style={styles.dateTextContainer}>
                    <Text style={styles.dateLabel}>Selected Date</Text>
                    <Text style={styles.dateValue}>
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>

                <TextInput
                  label="Description"
                  value={newExpense.details}
                  onChangeText={(text) => setNewExpense({...newExpense, details: text})}
                  mode="outlined"
                  style={styles.input}
                  placeholder="e.g., Lunch at cafe"
                  left={<TextInput.Icon icon="note-edit" />}
                />

                <TextInput
                  label="Amount"
                  value={newExpense.amount}
                  onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.input}
                  placeholder="0.00"
                  left={<TextInput.Icon icon="currency-inr" />}
                />

                <SegmentedButtons
                  value={newExpense.transaction_type}
                  onValueChange={(value) => setNewExpense({...newExpense, transaction_type: value})}
                  buttons={[
                    { value: 'credit', label: 'Income' },
                    { value: 'debit', label: 'Expense' }
                  ]}
                  style={styles.typeButtons}
                />

                <Button
                  mode="contained"
                  onPress={handleAddExpense}
                  loading={loading}
                  style={styles.addBtn}
                  labelStyle={styles.addBtnLabel}
                >
                  Add Entry
                </Button>
              </View>
            </Surface>
          )}
        </View>

        {/* Month/Year Picker - Only in Monthly View */}
        {viewMode === 'month' && (
          <Surface style={styles.monthSelectorCard} elevation={2}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-filter" size={18} color="#1976D2" />
              <Text style={styles.cardTitle}>Filter by Month & Year</Text>
            </View>
            <Divider style={styles.cardDivider} />
            <View style={styles.pickerContainer}>
              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Month</Text>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={setSelectedMonth}
                  style={styles.picker}
                >
                  {months.map(month => (
                    <Picker.Item key={month.value} label={month.label} value={month.value} />
                  ))}
                </Picker>
              </View>
              <View style={styles.pickerWrapper}>
                <Text style={styles.pickerLabel}>Year</Text>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={setSelectedYear}
                  style={styles.picker}
                >
                  {years.map(year => (
                    <Picker.Item key={year} label={year.toString()} value={year} />
                  ))}
                </Picker>
              </View>
            </View>
          </Surface>
        )}

        {/* Entries List */}
        <Surface style={styles.entriesCard} elevation={2}>
          <View style={styles.entriesHeader}>
            <View>
              <Text style={styles.entriesTitle}>
                {viewMode === 'day' 
                  ? `Entries - ${selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Select Date'}` 
                  : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} Entries`
                }
              </Text>
              <Text style={styles.entriesSubtitle}>
                {viewMode === 'day' ? 'Daily transactions' : 'Monthly overview'}
              </Text>
            </View>
            <Chip style={styles.countChip} textStyle={styles.countChipText}>
              {viewMode === 'day' ? dayExpenses.length : monthlyExpenses.length}
            </Chip>
          </View>

          {/* Totals */}
          {(viewMode === 'day' && selectedDate) || viewMode === 'month' ? (
            <View style={styles.totalSummary}>
              <View style={styles.totalRow}>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Income</Text>
                  <Text style={[styles.totalAmount, styles.incomeAmount]}>
                    ₹{(viewMode === 'day' ? dailyTotal.credit : monthlyTotal.credit).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Expenses</Text>
                  <Text style={[styles.totalAmount, styles.expenseAmount]}>
                    ₹{(viewMode === 'day' ? dailyTotal.debit : monthlyTotal.debit).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.totalItem}>
                  <Text style={styles.totalLabel}>Net</Text>
                  <Text style={[
                    styles.totalAmount, 
                    styles.netAmount,
                    { color: (viewMode === 'day' ? dailyTotal.net : monthlyTotal.net) >= 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    ₹{(viewMode === 'day' ? dailyTotal.net : monthlyTotal.net).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          <Divider style={styles.entriesDivider} />

          <View style={styles.entriesList}>
            {viewMode === 'day' ? (
              dayExpenses.length > 0 ? renderExpenseItem(dayExpenses) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="inbox-outline" size={48} color="#CCC" />
                  <Text style={styles.emptyStateText}>No entries for this date</Text>
                  <Text style={styles.emptyStateSubtext}>Select a date and add your first transaction</Text>
                </View>
              )
            ) : (
              monthlyExpenses.length > 0 ? renderExpenseItem(monthlyExpenses) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="chart-box-outline" size={48} color="#CCC" />
                  <Text style={styles.emptyStateText}>No entries for this month</Text>
                  <Text style={styles.emptyStateSubtext}>Start tracking your expenses and income</Text>
                </View>
              )
            )}
          </View>
        </Surface>

        {/* Edit Modal */}
        <Portal>
          <Modal visible={editModalVisible} onDismiss={() => setEditModalVisible(false)} contentContainerStyle={styles.modalContainer}>
            <Surface style={styles.modalContent} elevation={5}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Entry</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
              <Divider style={styles.modalHeaderDivider} />
              <ScrollView style={styles.modalScrollContent}>
                <TextInput
                  label="Description"
                  value={editForm.details}
                  onChangeText={(text) => setEditForm({...editForm, details: text})}
                  mode="outlined"
                  style={styles.modalInput}
                  left={<TextInput.Icon icon="note-edit" />}
                />
                <TextInput
                  label="Amount"
                  value={editForm.amount}
                  onChangeText={(text) => setEditForm({...editForm, amount: text})}
                  mode="outlined"
                  keyboardType="numeric"
                  style={styles.modalInput}
                  left={<TextInput.Icon icon="currency-inr" />}
                />
                <SegmentedButtons
                  value={editForm.transaction_type}
                  onValueChange={(value) => setEditForm({...editForm, transaction_type: value})}
                  buttons={[
                    { value: 'credit', label: 'Income' },
                    { value: 'debit', label: 'Expense' }
                  ]}
                  style={styles.modalSegmented}
                />
                <View style={styles.modalActions}>
                  <Button mode="outlined" onPress={() => setEditModalVisible(false)} style={styles.modalButton}>
                    Cancel
                  </Button>
                  <Button mode="contained" onPress={handleUpdateExpense} style={styles.modalButton}>
                    Save
                  </Button>
                </View>
              </ScrollView>
            </Surface>
          </Modal>
        </Portal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Header
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.08)',
  },
  headerLeft: {
    flex: 1,
    minWidth: 200,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  tabsContainer: {
    alignItems: 'flex-end',
  },
  segmentedButtons: {
    width: 260,
  },

  // Grid
  contentGrid: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 20,
  },
  contentGridRow: {
    flexDirection: 'row',
  },

  calendarCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.08)',
  },
  calendarCardLarge: {
    flex: 1,
    marginRight: 8,
  },
  calendarWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.08)',
  },
  formCardLarge: {
    flex: 1,
    marginLeft: 8,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(25, 118, 210, 0.03)',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardDivider: {
    backgroundColor: 'rgba(200, 200, 200, 0.15)',
  },

  formContent: {
    padding: 16,
    gap: 14,
  },
  dateSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.1)',
  },
  dateTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#fafafa',
  },
  typeButtons: {
    marginVertical: 8,
  },
  addBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 4,
  },
  addBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Month Selector
  monthSelectorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.08)',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  pickerWrapper: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  picker: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
  },

  // Entries Card
  entriesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.15)',
    marginBottom: 20,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  entriesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  entriesSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  countChip: {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    height: 32,
  },
  countChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1976D2',
  },
  entriesDivider: {
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
  },
  entriesList: {
    padding: 12,
  },

  // Expense Item
  expenseCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.1)',
  },
  expenseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  typeIndicator: {
    width: 5,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  expenseDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  expenseActions: {
    alignItems: 'flex-end',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  amountSymbol: {
    fontSize: 12,
    color: '#666',
  },
  expenseAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  editIcon: { fontSize: 18 },
  deleteIcon: { fontSize: 18 },

  // Totals
  totalSummary: {
    backgroundColor: 'rgba(25, 118, 210, 0.05)',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.1)',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  incomeAmount: { color: '#4CAF50' },
  expenseAmount: { color: '#F44336' },
  netAmount: { fontSize: 16, fontWeight: '800' },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },

  // Modal
  modalContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },
  modalHeaderDivider: {
    marginHorizontal: 20,
  },
  modalScrollContent: {
    padding: 20,
  },
  modalInput: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  modalSegmented: {
    marginVertical: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
});