// src/screens/LeaveHistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { X, Calendar, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMyLeaveRequests } from './api';

export default function LeaveHistoryScreen({ navigation }) {
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
    <SafeAreaView style={styles.container}>
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
          <View style={styles.historyItem}>
            <Text style={styles.historyDate}>{item.request_date}</Text>
            <Text style={styles.historyType}>{item.type}</Text>
            <Text style={styles.historyReason}>{item.reason}</Text>
            <Text style={[styles.historyStatus, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
            {item.image_url && (
              <Text style={styles.hasFile}>📎 Has attachment</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No leave requests found.</Text>
        }
      />
    </SafeAreaView>
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
  historyItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyDate: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  historyType: { fontSize: 13, fontWeight: '500', color: '#00897B', marginBottom: 4 },
  historyReason: { fontSize: 13, color: '#475569', marginBottom: 6 },
  historyStatus: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  hasFile: { fontSize: 11, color: '#64748B', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 50 },
});