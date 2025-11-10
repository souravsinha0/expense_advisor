import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Searchbar, FAB } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { expenseAPI } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function ExpenseDetailScreen({ route, navigation }) {
  const { year, month } = route.params || { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthlyStats, setMonthlyStats] = useState(null);

  useEffect(() => {
    loadData();
  }, [year, month]);

  useEffect(() => {
    filterExpenses();
  }, [searchQuery, expenses]);

  const loadData = async () => {
    try {
      const [expensesResponse, statsResponse] = await Promise.all([
        expenseAPI.getExpenses(year, month),
        expenseAPI.getMonthlyStats(year, month)
      ]);
      
      setExpenses(expensesResponse.data);
      setMonthlyStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filterExpenses = () => {
    if (!searchQuery) {
      setFilteredExpenses(expenses);
    } else {
      const filtered = expenses.filter(expense =>
        expense.details.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExpenses(filtered);
    }
  };

  const pieData = monthlyStats ? [
    {
      name: 'Income',
      amount: monthlyStats.total_credit,
      color: '#4CAF50',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
    {
      name: 'Expenses',
      amount: monthlyStats.total_debit,
      color: '#F44336',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    },
  ] : [];

  return (
    <View style={styles.container}>
      <ScrollView>
        {monthlyStats && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Monthly Overview - {month}/{year}</Title>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Income</Text>
                  <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                    ${monthlyStats.total_credit.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Expenses</Text>
                  <Text style={[styles.statValue, { color: '#F44336' }]}>
                    ${monthlyStats.total_debit.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Net Amount</Text>
                  <Text style={[
                    styles.statValue,
                    { color: monthlyStats.net_amount >= 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    ${monthlyStats.net_amount.toFixed(2)}
                  </Text>
                </View>
              </View>
              
              {pieData.length > 0 && (
                <PieChart
                  data={pieData}
                  width={screenWidth - 60}
                  height={200}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                />
              )}
            </Card.Content>
          </Card>
        )}

        <Card style={styles.card}>
          <Card.Content>
            <Searchbar
              placeholder="Search transactions..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />
            
            <Title>Transactions ({filteredExpenses.length})</Title>
            {filteredExpenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDetails}>{expense.details}</Text>
                  <Text style={styles.expenseDate}>
                    {new Date(expense.transaction_date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[
                  styles.expenseAmount,
                  { color: expense.transaction_type === 'credit' ? '#4CAF50' : '#F44336' }
                ]}>
                  {expense.transaction_type === 'credit' ? '+' : '-'}${expense.amount}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('Calendar')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 15,
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  searchbar: {
    marginBottom: 15,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDetails: {
    fontSize: 16,
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200EE',
  },
});