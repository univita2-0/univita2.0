/* src/screens/LeaveBalancesScreen.js */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { CalendarDays, TrendingUp } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

export default function LeaveBalancesScreen() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const currentYear = new Date().getFullYear();

  const loadBalances = async () => {
  if (!userId) return;
  setLoading(true);
  try {
    const res = await fetch(`${API_URL}/leave-balances/${userId}?year=${currentYear}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setBalances(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Failed to load leave balances:', error);
    setBalances([]);
    Alert.alert('Connection Error', 'Cannot reach the server. Please check your network and backend.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('user_id');
      if (id) setUserId(id);
      else setLoading(false);
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) loadBalances();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBalances();
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00897B"]} />}
      >
        <View style={styles.header}>
          <CalendarDays size={32} color="#00897B" />
          <Text style={styles.title}>My Leave Balances</Text>
          <Text style={styles.subtitle}>Year {currentYear}</Text>
        </View>

        {balances.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No leave balances found.</Text>
            <Text style={styles.emptySubtext}>Please contact HR.</Text>
          </View>
        ) : (
          balances.map((item, idx) => (
            <View key={idx} style={styles.balanceCard}>
              <View style={styles.cardLeft}>
                <TrendingUp size={24} color="#00897B" />
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.leaveType}>{item.leave_type}</Text>
                <Text style={styles.remaining}>
                  {item.remaining_days} day{item.remaining_days !== 1 ? 's' : ''} remaining
                </Text>
                <Text style={styles.quota}>Annual quota: {item.annual_quota} days</Text>
              </View>
            </View>
          ))
        )}

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            📌 Leave requests automatically deduct from your balance upon approval.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  balanceCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
  },
  cardLeft: { marginRight: 16, justifyContent: 'center' },
  cardRight: { flex: 1 },
  leaveType: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  remaining: { fontSize: 22, fontWeight: '800', color: '#00897B', marginTop: 4 },
  quota: { fontSize: 13, color: '#64748B', marginTop: 4 },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#94A3B8' },
  emptySubtext: { fontSize: 13, color: '#94A3B8', marginTop: 8 },
  noteBox: {
    backgroundColor: '#F0FDFA',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  noteText: { fontSize: 13, color: '#0F766E', textAlign: 'center' },
});