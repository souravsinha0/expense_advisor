import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Button, SegmentedButtons, Text, Chip } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { reportAPI } from '../services/api';
import { theme, commonStyles } from '../utils/theme';

export default function ReportsScreen({ navigation }) {
  const [fromMonth, setFromMonth] = useState(new Date().getMonth() + 1);
  const [fromYear, setFromYear] = useState(new Date().getFullYear());
  const [toMonth, setToMonth] = useState(new Date().getMonth() + 1);
  const [toYear, setToYear] = useState(new Date().getFullYear());
  const [transactionType, setTransactionType] = useState('both');
  const [loading, setLoading] = useState(false);

  const months = [
    { label: 'January', value: 1 }, { label: 'February', value: 2 }, { label: 'March', value: 3 },
    { label: 'April', value: 4 }, { label: 'May', value: 5 }, { label: 'June', value: 6 },
    { label: 'July', value: 7 }, { label: 'August', value: 8 }, { label: 'September', value: 9 },
    { label: 'October', value: 10 }, { label: 'November', value: 11 }, { label: 'December', value: 12 }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const generateReport = async (format) => {
    setLoading(true);
    try {
      const params = {
        from_year: fromYear,
        from_month: fromMonth,
        to_year: toYear,
        to_month: toMonth,
      };

      if (transactionType !== 'both') {
        params.transaction_type = transactionType;
      }

      let response;
      if (format === 'pdf') {
        response = await reportAPI.generatePDF(params);
      } else {
        response = await reportAPI.generateExcel(params);
      }

      // Handle file download
      if (response.data) {
        const blob = new Blob([response.data], {
          type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileExtension = format === 'excel' ? 'xlsx' : 'pdf'; // ✅ explicit mapping
        link.href = url;
        link.download = `expense_report_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        Alert.alert('Success', `${format.toUpperCase()} report downloaded successfully`);
      } else {
        Alert.alert('Error', 'No data received from server');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      Alert.alert('Error', `Failed to generate ${format.toUpperCase()} report. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={[commonStyles.card, styles.headerCard]}>
          <Card.Content>
            <Title style={[commonStyles.title, styles.headerTitle]}>Generate Reports</Title>
            <Text style={styles.headerSubtitle}>Create detailed financial reports for any date range</Text>
          </Card.Content>
        </Card>

        {/* Date Range Selection */}
        <Card style={commonStyles.card}>
          <Card.Content>
            <Title style={commonStyles.subtitle}>📅 Date Range</Title>
            
            <View style={styles.dateSection}>
              <Text style={styles.sectionLabel}>From Date</Text>
              <View style={styles.dateRow}>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={fromMonth}
                      onValueChange={setFromMonth}
                      style={styles.picker}
                    >
                      {months.map(month => (
                        <Picker.Item key={month.value} label={month.label} value={month.value} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Year</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={fromYear}
                      onValueChange={setFromYear}
                      style={styles.picker}
                    >
                      {years.map(year => (
                        <Picker.Item key={year} label={year.toString()} value={year} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.dateSection}>
              <Text style={styles.sectionLabel}>To Date</Text>
              <View style={styles.dateRow}>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Month</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={toMonth}
                      onValueChange={setToMonth}
                      style={styles.picker}
                    >
                      {months.map(month => (
                        <Picker.Item key={month.value} label={month.label} value={month.value} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Year</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={toYear}
                      onValueChange={setToYear}
                      style={styles.picker}
                    >
                      {years.map(year => (
                        <Picker.Item key={year} label={year.toString()} value={year} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.selectedRange}>
              <Chip icon="calendar-range" mode="outlined">
                {months.find(m => m.value === fromMonth)?.label} {fromYear} - {months.find(m => m.value === toMonth)?.label} {toYear}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Transaction Type Filter */}
        <Card style={commonStyles.card}>
          <Card.Content>
            <Title style={commonStyles.subtitle}>🔍 Filter Options</Title>
            <Text style={styles.filterLabel}>Transaction Type</Text>
            <SegmentedButtons
              value={transactionType}
              onValueChange={setTransactionType}
              buttons={[
                { value: 'both', label: 'All', icon: 'format-list-bulleted' },
                { value: 'credit', label: 'Income', icon: 'trending-up' },
                { value: 'debit', label: 'Expenses', icon: 'trending-down' }
              ]}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Generate Reports */}
        <Card style={[commonStyles.card, styles.actionCard]}>
          <Card.Content>
            <Title style={commonStyles.subtitle}>📊 Generate Reports</Title>
            <Text style={styles.actionDescription}>
              Choose your preferred format to download the report
            </Text>
            
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={() => generateReport('pdf')}
                loading={loading}
                style={[styles.reportButton, styles.pdfButton]}
                contentStyle={styles.buttonContent}
                icon="file-pdf-box"
              >
                Generate PDF
              </Button>
              <Button
                mode="contained"
                onPress={() => generateReport('excel')}
                loading={loading}
                style={[styles.reportButton, styles.excelButton]}
                contentStyle={styles.buttonContent}
                icon="file-excel-box"
              >
                Generate Excel
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 16,
  },
  dateSection: {
    marginVertical: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 16,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#666',
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    height: 50,
  },
  selectedRange: {
    alignItems: 'center',
    marginTop: 16,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  actionCard: {
    backgroundColor: '#FFF3E0',
    marginBottom: 20,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  reportButton: {
    flex: 1,
    borderRadius: 12,
  },
  pdfButton: {
    backgroundColor: '#36aae4ff',
  },
  excelButton: {
    backgroundColor: '#77ad34ff',
  },
  buttonContent: {
    paddingVertical: 8,
  },
});