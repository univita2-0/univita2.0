// src/screens/ScheduleScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
  ActivityIndicator, RefreshControl, Platform, StatusBar
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
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchedules();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN PROGRESS':
        return { label: 'IN PROGRESS', color: '#F59E0B', bg: '#FEF3C7', border: '#FDE68A' };
      case 'COMPLETED':
        return { label: 'COMPLETED', color: '#10B981', bg: '#ECFDF5', border: '#D1FAE5' };
      default:
        return { label: 'SCHEDULED', color: '#00897B', bg: '#E0F2F1', border: '#B2DFDB' };
    }
  };

  if (loading) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00897B" />
            <Text style={styles.loadingText}>Loading schedule...</Text>
          </View>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00897B"]} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <CalIcon size={28} color="#00897B" />
            <Text style={styles.title}>My Schedule</Text>
          </View>

          {/* Week Navigator */}
          <View style={styles.weekNavigator}>
            <TouchableOpacity
              onPress={() => changeWeek(-7)}
              style={styles.navButton}
              activeOpacity={0.7}
            >
              <ChevronLeft size={22} color="#00897B" />
            </TouchableOpacity>
            <View style={styles.weekRangeContainer}>
              <Text style={styles.weekRangeText}>{getWeekRange()}</Text>
            </View>
            <TouchableOpacity
              onPress={() => changeWeek(7)}
              style={styles.navButton}
              activeOpacity={0.7}
            >
              <ChevronRight size={22} color="#00897B" />
            </TouchableOpacity>
          </View>

          {/* Daily Cards */}
          {weekDays.map((dayName, index) => {
            const startOfWeek = getStartOfWeek(currentDate);
            const targetDate = new Date(startOfWeek);
            targetDate.setDate(startOfWeek.getDate() + index);
            const targetDateStr = targetDate.toLocaleDateString('en-CA');
            const daySchedule = schedules.find(s => s.date === targetDateStr);
            const status = daySchedule?.attendance_status || 'SCHEDULED';
            const badge = getStatusBadge(status);

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
                          <Text style={styles.infoText}>
                            {daySchedule.start_time?.substring(0,5)} – {daySchedule.end_time?.substring(0,5)}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <MapPin size={14} color="#6B7280" />
                          <Text style={styles.infoText}>{daySchedule.place || 'Main Campus'}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                        <View style={[styles.statusDot, { backgroundColor: badge.color }]} />
                        <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.noSchedule}>No classes scheduled</Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// ---------- MODERN STYLES ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A', letterSpacing: -0.3 },
  weekNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 40,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  navButton: { padding: 8, borderRadius: 30 },
  weekRangeContainer: { flex: 1, alignItems: 'center' },
  weekRangeText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayName: { fontSize: 12, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  dayDate: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  dayContent: { padding: 16 },
  noSchedule: { color: '#94A3B8', fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
  scheduleItem: { gap: 12 },
  courseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  courseText: { fontSize: 16, fontWeight: '700', color: '#0F172A', flex: 1 },
  detailsGrid: { gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 13, color: '#475569' },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
});