// src/screens/ScheduleScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
  ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock, MapPin, BookOpen, ChevronLeft, ChevronRight, Calendar as CalIcon
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserSchedule } from './api';

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // ---- Fetch schedule data ----
  const fetchSchedules = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const data = await fetchUserSchedule(user.employee_id);
        setSchedules(data);
      }
    } catch (err) {
      console.error('Fetch schedule error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  // ---- Week navigation ----
  const changeWeek = (daysOffset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + daysOffset);
    setCurrentDate(newDate);
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekRange = () => {
    const start = getStartOfWeek(currentDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#00897B" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00897B"]} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Instructor Schedule</Text>
        </View>

        {/* Week navigator */}
        <View style={styles.dateNavigator}>
          <TouchableOpacity onPress={() => changeWeek(-7)} style={styles.navBtn}>
            <ChevronLeft size={24} color="#00897B" />
          </TouchableOpacity>
          <View style={styles.rangeDisplay}>
            <CalIcon size={16} color="#64748B" style={{ marginRight: 8 }} />
            <Text style={styles.dateRangeText}>{getWeekRange()}</Text>
          </View>
          <TouchableOpacity onPress={() => changeWeek(7)} style={styles.navBtn}>
            <ChevronRight size={24} color="#00897B" />
          </TouchableOpacity>
        </View>

        {/* Daily schedule cards */}
        {weekDays.map((dayName, index) => {
  const startOfWeek = getStartOfWeek(currentDate);
  const targetDate = new Date(startOfWeek);
  targetDate.setDate(startOfWeek.getDate() + index);
  const targetDateStr = targetDate.toLocaleDateString('en-CA');
  const daySchedule = schedules.find(s => s.date === targetDateStr);

  // Determine if completed
  const isCompleted = daySchedule?.attendance_status === 'COMPLETED';

  return (
    <View key={dayName} style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayName}>{dayName.toUpperCase()}</Text>
        <Text style={styles.dayDate}>{targetDate.getDate()}</Text>
      </View>
      <View style={styles.dayContent}>
        {daySchedule ? (
          <View style={styles.scheduleItem}>
            <View style={styles.courseHeader}>
              <BookOpen size={18} color="#00897B" />
              <Text style={styles.courseText}>{daySchedule.course}</Text>
            </View>
            <View style={styles.detailsGrid}>
              <View style={styles.infoRow}>
                <Clock size={14} color="#6B7280" />
                <Text style={styles.timeText}>{daySchedule.start_time.substring(0,5)} - {daySchedule.end_time.substring(0,5)}</Text>
              </View>
              <View style={styles.infoRow}>
                <MapPin size={14} color="#6B7280" />
                <Text style={styles.placeText}>{daySchedule.place || 'Main Campus'}</Text>
              </View>
            </View>
            
            {/* Conditional Status Badge */}
            <View style={[styles.statusBadge, isCompleted && styles.completedBadge]}>
              <View style={[styles.statusDot, isCompleted && styles.completedDot]} />
              <Text style={[styles.statusText, isCompleted && styles.completedText]}>
                {isCompleted ? 'COMPLETED' : daySchedule.attendance_status}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noSchedule}>No Scheduled Classes</Text>
        )}
      </View>
    </View>
  );
})}
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginTop: Platform.OS === 'android' ? 10 : 20, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  dateNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rangeDisplay: { flexDirection: 'row', alignItems: 'center' },
  dateRangeText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  navBtn: { padding: 4 },
  dayCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
  },
  dayHeader: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayName: { fontWeight: '800', color: '#64748B', fontSize: 11, letterSpacing: 1 },
  dayDate: { fontWeight: '800', color: '#0F172A', fontSize: 14 },
  dayContent: { padding: 16 },
  noSchedule: { color: '#94A3B8', fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
  scheduleItem: { gap: 12 },
  courseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  courseText: { fontSize: 17, fontWeight: '800', color: '#0F172A', flex: 1 },
  detailsGrid: { gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeText: { fontSize: 13, color: '#334155', fontWeight: '600' },
  placeText: { fontSize: 13, color: '#64748B' },
  statusBadge: {
    backgroundColor: '#F0FDFA',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0D9488' },
  statusText: { color: '#0D9488', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
 
  statusBadge: {
    backgroundColor: '#F0FDFA',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0D9488' },
  statusText: { color: '#0D9488', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  
  // New styles for completed status
  completedBadge: { 
    backgroundColor: '#DCFCE7', 
    borderColor: '#BBF7D0' 
  },
  completedDot: { 
    backgroundColor: '#16A34A' 
  },
  completedText: { 
    color: '#16A34A' 
  },
});
