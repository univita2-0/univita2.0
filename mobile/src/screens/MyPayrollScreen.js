// src/screens/MyPayrollScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator,
  RefreshControl, Modal, TouchableOpacity, FlatList
} from 'react-native';
import { CalendarDays, ChevronRight, X, Eye, TrendingUp, TrendingDown } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchEmployeePayrollHistory } from './api';

export default function MyPayrollScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allPayslips, setAllPayslips] = useState([]);

  // Modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const loadData = useCallback(async () => {
    try {
      const employeeId = await AsyncStorage.getItem('employee_id');
      if (employeeId) {
        const data = await fetchEmployeePayrollHistory(employeeId);
        setAllPayslips(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('My Payroll load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const currentMonthPayslip = allPayslips.find(record => record.month_year === currentMonth);
  const pastPayslips = allPayslips.filter(record => record.month_year !== currentMonth);

  const openDetailModal = (record) => {
    setSelectedPayslip(record);
    setShowDetailModal(true);
  };

  // Helper to format currency
  const formatCurrency = (value) => {
    const num = Number(value || 0);
    return `₱${num.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  };

  // Render a payslip card (used for both current and past)
  const renderPayslipCard = (record, isCurrent = false) => (
    <View style={[styles.card, isCurrent && styles.currentCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.monthBadge}>
          <CalendarDays size={16} color="#00897B" />
          <Text style={styles.monthText}>{record.month_year}</Text>
        </View>
        <TouchableOpacity onPress={() => openDetailModal(record)} style={styles.detailsButton}>
          <Eye size={16} color="#00897B" />
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Gross Pay</Text>
          <Text style={styles.value}>{formatCurrency(record.gross_pay)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Net Pay</Text>
          <Text style={[styles.value, { color: '#10B981' }]}>{formatCurrency(record.net_pay)}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Total Hours</Text>
          <Text style={styles.value}>{Number(record.total_hours || 0).toFixed(1)} hrs</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Overtime</Text>
          <Text style={styles.value}>{Number(record.overtime_hours || 0).toFixed(1)} hrs</Text>
        </View>
      </View>

      <View style={styles.divider} />
      <View style={styles.detailRow}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Tax</Text>
          <Text style={[styles.value, { color: '#EF4444' }]}>-{formatCurrency(record.tax_deduction)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>SSS</Text>
          <Text style={styles.value}>{formatCurrency(record.sss_deduction)}</Text>
        </View>
      </View>
    </View>
  );

  // Detailed modal with full breakdown
  const renderDetailModal = () => {
    if (!selectedPayslip) return null;
    const p = selectedPayslip;

    return (
      <Modal visible={showDetailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{p.month_year} Payslip</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Earnings Section */}
              <Text style={styles.sectionTitle}>Earnings</Text>
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Basic Pay (Rate × Hours)</Text>
                  <Text style={styles.detailValue}>{formatCurrency(p.gross_pay - (p.overtime_pay || 0))}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Overtime Pay</Text>
                  <Text style={styles.detailValue}>{formatCurrency(p.overtime_pay)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transport Allowance</Text>
                  <Text style={styles.detailValue}>{formatCurrency(p.transport_allowance)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Meal Allowance</Text>
                  <Text style={styles.detailValue}>{formatCurrency(p.meal_allowance)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Housing Allowance</Text>
                  <Text style={styles.detailValue}>{formatCurrency(p.housing_allowance)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabelBold}>Gross Pay</Text>
                  <Text style={styles.detailValueBold}>{formatCurrency(p.gross_pay)}</Text>
                </View>
              </View>

              {/* Deductions Section */}
              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Deductions</Text>
              <View style={styles.detailSection}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>SSS Contribution</Text>
                  <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(p.sss_deduction)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PhilHealth</Text>
                  <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(p.philhealth_deduction)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pag‑IBIG</Text>
                  <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(p.pagibig_deduction)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Withholding Tax</Text>
                  <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(p.tax_deduction)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Loan Deduction</Text>
                  <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(p.loan_deduction)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Other Deductions</Text>
                  <Text style={[styles.detailValue, { color: '#EF4444' }]}>-{formatCurrency(p.other_deduction)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabelBold}>Total Deductions</Text>
                  <Text style={[styles.detailValueBold, { color: '#EF4444' }]}>
                    -{formatCurrency(
                      (p.sss_deduction || 0) + (p.philhealth_deduction || 0) + (p.pagibig_deduction || 0) +
                      (p.tax_deduction || 0) + (p.loan_deduction || 0) + (p.other_deduction || 0)
                    )}
                  </Text>
                </View>
              </View>

              {/* Net Pay */}
              <View style={[styles.detailSection, { backgroundColor: '#E0F2F1', marginTop: 16, marginBottom: 20 }]}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabelBold}>Net Pay (Take‑home)</Text>
                  <Text style={[styles.detailValueBold, { color: '#00897B', fontSize: 18 }]}>{formatCurrency(p.net_pay)}</Text>
                </View>
              </View>

              {/* Note about absent/late */}
              <Text style={styles.footnote}>
                * Absent and late days are already reflected in the total hours and basic pay calculation.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#00897B" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00897B"]} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Payroll</Text>
          <Text style={styles.subtitle}>Your finalized payslips</Text>
        </View>

        {/* Current Month Section */}
        {currentMonthPayslip ? (
          renderPayslipCard(currentMonthPayslip, true)
        ) : (
          <View style={styles.emptyCard}>
            <CalendarDays size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>No payslip yet</Text>
            <Text style={styles.emptySubtext}>
              Once the admin finalizes payroll for {currentMonth}, your payslip will appear here.
            </Text>
          </View>
        )}

        {/* Past Payslips Button */}
        {pastPayslips.length > 0 && (
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => setShowHistoryModal(true)}
          >
            <Text style={styles.historyButtonText}>View Past Payslips</Text>
            <ChevronRight size={20} color="#00897B" />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* History Modal (list of past payslips) */}
      <Modal visible={showHistoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.historyModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Past Payslips</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            {pastPayslips.length === 0 ? (
              <Text style={styles.emptyText}>No past payslips</Text>
            ) : (
              <FlatList
                data={pastPayslips}
                keyExtractor={(item, index) => (item.id || index).toString()}
                renderItem={({ item }) => renderPayslipCard(item)}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Detailed Modal (full breakdown) */}
      {renderDetailModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16 },
  header: { marginTop: 20, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },

  currentCard: { borderWidth: 2, borderColor: '#00897B' },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  monthBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E0F2F1', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  monthText: { fontSize: 14, fontWeight: '700', color: '#00897B' },
  detailsButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8 },
  detailsButtonText: { fontSize: 12, fontWeight: '600', color: '#00897B' },

  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap' },
  detailItem: { marginRight: 12, marginBottom: 4 },
  label: { fontSize: 12, color: '#64748B', marginBottom: 2 },
  value: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },

  emptyCard: { alignItems: 'center', padding: 30, backgroundColor: 'white', borderRadius: 16, elevation: 1, marginTop: 20 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#94A3B8', marginTop: 8 },
  emptySubtext: { fontSize: 13, color: '#94A3B8', marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },

  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E0F2F1',
    gap: 8,
  },
  historyButtonText: { fontSize: 15, fontWeight: '700', color: '#00897B' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  historyModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
    minHeight: 200,
  },
  detailModalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  detailSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0F172A',
  },
  detailLabelBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00897B',
  },
  footnote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontStyle: 'italic',
  },
});