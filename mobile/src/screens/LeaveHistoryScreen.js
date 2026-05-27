// src/screens/LeaveHistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Calendar, FileText, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyLeaveRequests } from './api';

export default function LeaveHistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const employeeId = await AsyncStorage.getItem('employee_id');
    if (employeeId) {
      const data = await fetchMyLeaveRequests(employeeId);
      setLeaveHistory(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status === 'Approved') return '#10B981';
    if (status === 'Rejected') return '#EF4444';
    return '#F59E0B';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#00897B" />
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <X size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Leave History</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={leaveHistory}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.historyCard}>
              <View style={styles.cardHeader}>
                <Calendar size={16} color="#00897B" />
                <Text style={styles.date}>{item.request_date?.split('T')[0]}</Text>
              </View>
              <View style={styles.cardBody}>
                <FileText size={14} color="#64748B" />
                <Text style={styles.type}>{item.type}</Text>
              </View>
              <Text style={styles.reason}>{item.reason}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>
              {item.image_url && (
                <View style={styles.attachmentBadge}>
                  <AlertCircle size={12} color="#64748B" />
                  <Text style={styles.attachmentText}>Has attachment</Text>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No leave requests found.</Text>}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#fff',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  list: { padding: 16 },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  date: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  type: { fontSize: 13, fontWeight: '600', color: '#00897B' },
  reason: { fontSize: 13, color: '#475569', marginBottom: 10 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  attachmentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  attachmentText: { fontSize: 10, color: '#64748B' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 50 },
});