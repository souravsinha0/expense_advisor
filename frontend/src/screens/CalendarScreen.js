import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Title, TextInput, Button, SegmentedButtons, Text, Chip, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { expenseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { theme, commonStyles } from '../utils/theme';

const screenWidth = Dimensions.get('window').width;

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
      
      // Filter expenses for selected date
      const dateExpenses = response.data.filter(expense => 
        expense.transaction_date.startsWith(day.dateString)
      );
      setDayExpenses(dateExpenses);
    } catch (error) {
      console.error('Error loading day expenses:', error);
    }
  };

  const loadMonthlyExpenses = async () => {
    try {
      const response = await expenseAPI.getExpenses(selectedYear, selectedMonth);
      setMonthlyExpenses(response.data);
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
      
      // Reload expenses for selected date
      handleDateSelect({ dateString: selectedDate });
    } catch (error) {
      Alert.alert( 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    alert(
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseAPI.delete(expenseId);
              Alert.alert('Success', 'Expense deleted successfully');
              if (selectedDate) {
                handleDateSelect({ dateString: selectedDate });
              } else {
                loadMonthlyExpenses();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          }
        }
      ]
    );
  };

  // const renderExpenseItem = (expense) => (
  //   <View key={expense.id} style={styles.expenseItem}>
  //     <View style={styles.expenseInfo}>
  //       <Text style={styles.expenseDetails}>{expense.details}</Text>
  //       <Text style={styles.expenseDate}>
  //         {new Date(expense.transaction_date).toLocaleDateString()}
  //       </Text>
  //     </View>
  //     <View style={styles.expenseActions}>
  //       <Text style={[
  //         styles.expenseAmount,
  //         { color: expense.transaction_type === 'credit' ? theme.colors.income : theme.colors.expense }
  //       ]}>
  //         {expense.transaction_type === 'credit' ? '+' : '-'}{expense.amount} {user?.currency || 'USD'}
  //       </Text>
  //       <IconButton
  //         icon="delete"
  //         size={18}
  //         onPress={() => handleDeleteExpense(expense.id)}
  //         style={styles.deleteButton}
  //       />
  //     </View>
  //   </View>
  // );

  const renderExpenseItem = (expenses = []) => {
  if (!Array.isArray(expenses)) return null; // safety check

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
  );

  return sorted.map((expense) => (
    <View key={`${expense.id}-${expense.transaction_date}`} style={styles.expenseItem}>
      <View style={styles.expenseInfo}>
        <Text style={styles.expenseDetails}>{expense.details}</Text>
        <Text style={styles.expenseDate}>
          {new Date(expense.transaction_date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.expenseActions}>
        <Text
          style={[
            styles.expenseAmount,
            {
              color:
                expense.transaction_type === 'credit'
                  ? theme.colors.income
                  : theme.colors.expense,
            },
          ]}
        >
          {expense.transaction_type === 'credit' ? '+' : '-'}
          {expense.amount} {user?.currency || 'INR'}
        </Text>

        <IconButton
          icon="delete"
          size={18}
          onPress={() => handleDeleteExpense(expense.id)}
          style={styles.deleteButton}
        />
      </View>
    </View>
  ));
};



  return (
    <View style={commonStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* View Mode Toggle */}
        <Card style={commonStyles.card}>
          <Card.Content>
            <SegmentedButtons
              value={viewMode}
              onValueChange={setViewMode}
              buttons={[
                { value: 'day', label: 'Daily View' },
                { value: 'month', label: 'Monthly View' }
              ]}
            />
          </Card.Content>
        </Card>

        <View style={styles.mainContent}>
          {/* Left Side - Calendar */}
          <Card style={[commonStyles.card, styles.calendarCard]}>
            <Card.Content>
              <Title style={commonStyles.subtitle}>Select Date</Title>
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: theme.colors.primary }
                }}
                theme={{
                  selectedDayBackgroundColor: theme.colors.primary,
                  todayTextColor: theme.colors.primary,
                  arrowColor: theme.colors.primary,
                  monthTextColor: theme.colors.primary,
                  textDayFontWeight: '500',
                }}
              />
            </Card.Content>
          </Card>

          {/* Right Side - Expense Form */}
          {selectedDate && (
            <Card style={[commonStyles.card, styles.formCard]}>
              <Card.Content>
                <Title style={commonStyles.subtitle}>Add Entry</Title>
                <Text style={styles.selectedDateText}>{selectedDate}</Text>
                
                <TextInput
                  label="Details"
                  value={newExpense.details}
                  onChangeText={(text) => setNewExpense({...newExpense, details: text})}
                  mode="outlined"
                  style={[commonStyles.input, styles.compactInput]}
                />
                
                <TextInput
                  label="Amount"
                  value={newExpense.amount}
                  onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[commonStyles.input, styles.compactInput]}
                />
                
                <SegmentedButtons
                  value={newExpense.transaction_type}
                  onValueChange={(value) => setNewExpense({...newExpense, transaction_type: value})}
                  buttons={[
                    { value: 'credit', label: 'Income' },
                    { value: 'debit', label: 'Expense' }
                  ]}
                  style={styles.compactInput}
                />
                
                <Button
                  mode="contained"
                  onPress={handleAddExpense}
                  loading={loading}
                  style={[commonStyles.button, styles.addButton]}
                >
                  Add Entry
                </Button>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Month/Year Selector for Monthly View */}
        {viewMode === 'month' && (
          <Card style={commonStyles.card}>
            <Card.Content>
              <Title style={commonStyles.subtitle}>Select Month & Year</Title>
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
            </Card.Content>
          </Card>
        )}

        {/* Expenses List */}
        <Card style={commonStyles.card}>
          <Card.Content>
            <View style={styles.expenseHeader}>
              <Title style={commonStyles.subtitle}>
                {viewMode === 'day' ? `Entries for ${selectedDate}` : `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear} Entries`}
              </Title>
              <Chip icon="receipt" mode="outlined">
                {viewMode === 'day' ? dayExpenses.length : monthlyExpenses.length} entries
              </Chip>
            </View>
            
              {viewMode === 'day' ? (
                dayExpenses.length > 0 ? (
                  renderExpenseItem(dayExpenses)
                ) : (
                  <Text style={styles.noDataText}>No entries for this date</Text>
                )
              ) : (
                monthlyExpenses.length > 0 ? (
                  renderExpenseItem(monthlyExpenses)
                ) : (
                  <Text style={styles.noDataText}>No entries for this month</Text>
                )
              )}

          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flexDirection: screenWidth > 768 ? 'row' : 'column',
    gap: 8,
  },
  calendarCard: {
    flex: screenWidth > 768 ? 1 : undefined,
  },
  formCard: {
    flex: screenWidth > 768 ? 1 : undefined,
    backgroundColor: '#F3E5F5',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  compactInput: {
    marginVertical: 6,
  },
  addButton: {
    marginTop: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  pickerWrapper: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: theme.colors.primary,
  },
  picker: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginVertical: 4,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDetails: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  expenseDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  expenseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    margin: 0,
    backgroundColor: '#FFEBEE',
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});