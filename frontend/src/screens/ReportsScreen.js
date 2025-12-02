import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity, Modal } from 'react-native';
import {
  Button,
  SegmentedButtons,
  Text,
  Surface,
  Divider,
  IconButton,
} from 'react-native-paper';

import { reportAPI } from '../services/api';
import { commonStyles } from '../utils/theme';

export default function ReportsScreen({ navigation }) {
  const today = new Date();
  const [fromDate, setFromDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [toDate, setToDate] = useState(new Date(today.getFullYear(), today.getMonth() + 1, 0));

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [transactionType, setTransactionType] = useState('both');
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - i);

  const handleFromDateSelect = (month, year) => {
    setFromDate(new Date(year, month, 1));
    setShowFromPicker(false);
  };

  const handleToDateSelect = (month, year) => {
    const lastDay = new Date(year, month + 1, 0);
    setToDate(lastDay);
    setShowToPicker(false);
  };

  const DatePickerModal = ({ visible, onClose, onSelect, currentDate }) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Surface style={styles.pickerModal}>
          <Text style={styles.pickerTitle}>Select Month & Year</Text>
          <View style={styles.pickerContent}>
            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>Month</Text>
              <ScrollView style={styles.pickerScroll}>
                {months.map((month, idx) => (
                  <TouchableOpacity
                    key={month}
                    style={[styles.pickerItem, currentDate.getMonth() === idx && styles.pickerItemActive]}
                    onPress={() => onSelect(idx, currentDate.getFullYear())}
                  >
                    <Text style={[styles.pickerItemText, currentDate.getMonth() === idx && styles.pickerItemTextActive]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={styles.pickerColumn}>
              <Text style={styles.columnLabel}>Year</Text>
              <ScrollView style={styles.pickerScroll}>
                {years.map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[styles.pickerItem, currentDate.getFullYear() === year && styles.pickerItemActive]}
                    onPress={() => onSelect(currentDate.getMonth(), year)}
                  >
                    <Text style={[styles.pickerItemText, currentDate.getFullYear() === year && styles.pickerItemTextActive]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <Button mode="contained" onPress={onClose} style={styles.pickerCloseBtn}>
            Done
          </Button>
        </Surface>
      </View>
    </Modal>
  );

  const generateReport = async (format) => {
    setLoading(true);
    try {
      const params = {
        from_year: fromDate.getFullYear(),
        from_month: fromDate.getMonth() + 1,
        to_year: toDate.getFullYear(),
        to_month: toDate.getMonth() + 1,
      };

      if (transactionType !== 'both') {
        params.transaction_type = transactionType;
      }

      const response = format === 'pdf'
        ? await reportAPI.generatePDF(params)
        : await reportAPI.generateExcel(params);

      if (response?.data) {
        const blob = new Blob([response.data], {
          type: format === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report_${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, '0')}_to_${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, '0')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Alert.alert('Success', `${format.toUpperCase()} report downloaded!`);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Surface style={styles.headerCard} elevation={5}>
          <Text style={styles.headerTitle}>Generate Reports</Text>
          <Text style={styles.headerSubtitle}>Download monthly financial reports</Text>
        </Surface>

        <Surface style={styles.card} elevation={3}>
          <Text style={styles.cardTitle}>Date Range</Text>
          <Divider style={styles.divider} />

          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={styles.label}>From</Text>
              <View style={styles.dateButton}>
                <Text style={styles.dateText}>{formatDate(fromDate)}</Text>
                <IconButton
                  icon="calendar"
                  size={24}
                  onPress={() => setShowFromPicker(true)}
                  color="#4361ee"
                />
              </View>
            </View>

            <Text style={styles.arrow}>→</Text>

            <View style={styles.dateBox}>
              <Text style={styles.label}>To</Text>
              <View style={styles.dateButton}>
                <Text style={styles.dateText}>{formatDate(toDate)}</Text>
                <IconButton
                  icon="calendar"
                  size={24}
                  onPress={() => setShowToPicker(true)}
                  color="#4361ee"
                />
              </View>
            </View>
          </View>

          <DatePickerModal
            visible={showFromPicker}
            onClose={() => setShowFromPicker(false)}
            onSelect={handleFromDateSelect}
            currentDate={fromDate}
          />
          <DatePickerModal
            visible={showToPicker}
            onClose={() => setShowToPicker(false)}
            onSelect={handleToDateSelect}
            currentDate={toDate}
          />
        </Surface>

        <Surface style={styles.card} elevation={3}>
          <Text style={styles.cardTitle}>Transaction Type</Text>
          <Divider style={styles.divider} />

          <SegmentedButtons
            value={transactionType}
            onValueChange={setTransactionType}
            buttons={[
              { value: 'both', label: 'All' },
              { value: 'credit', label: 'Income' },
              { value: 'debit', label: 'Expenses' },
            ]}
          />
        </Surface>

        <Surface style={[styles.card, styles.downloadCard]} elevation={4}>
          <Text style={styles.cardTitle}>Download Report</Text>
          <Divider style={styles.divider} />

          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={() => generateReport('pdf')}
              loading={loading}
              disabled={loading}
              icon="file-pdf-box"
              contentStyle={styles.btnHeight}
              style={styles.pdfBtn}
            >
              Download PDF
            </Button>

            <Button
              mode="contained"
              onPress={() => generateReport('excel')}
              loading={loading}
              disabled={loading}
              icon="file-excel"
              contentStyle={styles.btnHeight}
              style={styles.excelBtn}
            >
              Download Excel
            </Button>
          </View>
        </Surface>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  headerCard: {
    backgroundColor: '#204ea8fb',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  headerSubtitle: { fontSize: 16, color: '#dbeafe', marginTop: 6 },

  card: { backgroundColor: 'white', borderRadius: 18, padding: 18, marginBottom: 16 },
  downloadCard: { borderWidth: 1.5, borderColor: '#10b98130' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
  divider: { marginVertical: 14, backgroundColor: '#e2e8f0' },

  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateBox: { flex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateText: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  arrow: { fontSize: 30, color: '#94a3b8', marginHorizontal: 16 },

  buttonRow: { flexDirection: 'row', gap: 14, marginTop: 10 },
  btnHeight: { height: 56 },
  pdfBtn: { flex: 1, backgroundColor: '#7b4d81ff', borderRadius: 14 },
  excelBtn: { flex: 1, backgroundColor: '#16a1a3ff', borderRadius: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  pickerModal: { width: '80%', maxWidth: 400, borderRadius: 20, padding: 20 },
  pickerTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: '#1e293b' },
  pickerContent: { flexDirection: 'row', gap: 16, marginBottom: 16, height: 250 },
  pickerColumn: { flex: 1 },
  columnLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 8 },
  pickerScroll: { flex: 1 },
  pickerItem: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
  pickerItemActive: { backgroundColor: '#4361ee' },
  pickerItemText: { fontSize: 14, fontWeight: '500', color: '#64748b', textAlign: 'center' },
  pickerItemTextActive: { color: 'white', fontWeight: '700' },
  pickerCloseBtn: { backgroundColor: '#4361ee', borderRadius: 12 },
});
