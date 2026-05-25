// src/screens/CalendarScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, RefreshControl,
  Modal, TouchableOpacity, FlatList
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MapPin, Clock, Calendar as CalendarIcon, X, List } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchEvents } from './api';

export default function CalendarScreen() {
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showHolidaysModal, setShowHolidaysModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const leaveCategories = ['Sick Leave', 'Vacation', 'Emergency', 'Other', 'Leave'];

  const getPHHolidays = (year) => [
    { id: `ph-${year}-1`, title: "New Year's Day", date: `${year}-01-01`, type: 'Holiday' },
    { id: `ph-${year}-2`, title: "Araw ng Kagitingan", date: `${year}-04-09`, type: 'Holiday' },
    { id: `ph-${year}-3`, title: "Labor Day", date: `${year}-05-01`, type: 'Holiday' },
    { id: `ph-${year}-4`, title: "Independence Day", date: `${year}-06-12`, type: 'Holiday' },
    { id: `ph-${year}-5`, title: "Ninoy Aquino Day", date: `${year}-08-21`, type: 'Holiday' },
    { id: `ph-${year}-6`, title: "National Heroes Day", date: `${year}-08-31`, type: 'Holiday' },
    { id: `ph-${year}-7`, title: "All Saints Day", date: `${year}-11-01`, type: 'Holiday' },
    { id: `ph-${year}-8`, title: "Bonifacio Day", date: `${year}-11-30`, type: 'Holiday' },
    { id: `ph-${year}-9`, title: "Immaculate Conception", date: `${year}-12-08`, type: 'Holiday' },
    { id: `ph-${year}-10`, title: "Christmas Day", date: `${year}-12-25`, type: 'Holiday' },
    { id: `ph-${year}-11`, title: "Rizal Day", date: `${year}-12-30`, type: 'Holiday' },
  ];

  const loadData = useCallback(async () => {
    try {
      const eventData = await fetchEvents();
      const currentYear = new Date(todayStr).getFullYear();
      const phHolidays = getPHHolidays(currentYear);

      const cleanEvents = eventData.filter(e =>
        !leaveCategories.map(c => c.toLowerCase()).includes(e.type?.toLowerCase()) &&
        !e.title?.startsWith('LEAVE:') &&
        e.date >= todayStr &&
        (e.type !== 'Holiday' || !e.id?.toString().startsWith('ph-'))
      );
      setEvents(cleanEvents);

      const cleanHolidays = phHolidays.filter(h => h.date >= todayStr);
      setHolidays(cleanHolidays);

      const marks = {};
      marks[todayStr] = { selected: true, selectedColor: '#E8F5E9', selectedTextColor: '#00897B' };

      cleanEvents.forEach(event => {
        const date = event.date.split('T')[0];
        marks[date] = { ...marks[date], marked: true, dotColor: '#00897B' };
      });

      cleanHolidays.forEach(holiday => {
        marks[holiday.date] = { ...marks[holiday.date], marked: true, dotColor: '#EF4444' };
      });

      setMarkedDates(marks);
    } catch (error) {
      console.error("Data Load Error:", error);
    }
  }, [todayStr]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const onDayPress = (day) => {
    const date = day.dateString;
    const dayEvents = events.filter(e => e.date?.split('T')[0] === date);
    const dayHolidays = holidays.filter(h => h.date === date);
    const allItems = [...dayEvents, ...dayHolidays];

    if (allItems.length > 0) {
      setSelectedDate(date);
      setSelectedDateEvents(allItems);
      setShowDateModal(true);
    }
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.modalEventCard}>
      <Text style={styles.modalEventTitle}>{item.title || 'Untitled'}</Text>
      <View style={styles.modalDetailRow}>
        <CalendarIcon size={14} color="#6B7280" />
        <Text style={styles.modalDetailText}>{item.date?.split('T')[0] || 'Unknown date'}</Text>
      </View>
      {item.start_time && (
        <View style={styles.modalDetailRow}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.modalDetailText}>
            {item.start_time.substring(0,5)} {item.end_time ? `- ${item.end_time.substring(0,5)}` : ''}
          </Text>
        </View>
      )}
      {item.place && (
        <View style={styles.modalDetailRow}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.modalDetailText}>{item.place}</Text>
        </View>
      )}
      <Text style={styles.modalEventDesc}>{item.description || 'No description'}</Text>
    </View>
  );

  const renderDateItem = ({ item }) => {
    const isHoliday = item.type === 'Holiday' || (item.id && item.id.toString().startsWith('ph-'));
    if (isHoliday) {
      return (
        <View style={styles.modalHolidayCard}>
          <Text style={styles.modalHolidayName}>{item.title || 'Holiday'}</Text>
          <Text style={styles.modalHolidayDate}>{item.date || 'Unknown date'}</Text>
          <View style={styles.modalHolidayBadge}>
            <Text style={styles.modalHolidayBadgeText}>HOLIDAY</Text>
          </View>
        </View>
      );
    }
    return renderEventItem({ item });
  };

  const renderHolidayItem = ({ item }) => (
    <View style={styles.modalHolidayCard}>
      <Text style={styles.modalHolidayName}>{item.title}</Text>
      <Text style={styles.modalHolidayDate}>{item.date}</Text>
      <View style={styles.modalHolidayBadge}>
        <Text style={styles.modalHolidayBadgeText}>HOLIDAY</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00897B"]} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Shared Calendar</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowEventsModal(true)}>
            <List size={18} color="#00897B" />
            <Text style={styles.actionButtonText}>Upcoming Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.holidayButton]} onPress={() => setShowHolidaysModal(true)}>
            <CalendarIcon size={18} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Philippine Holidays</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Calendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{ todayTextColor: '#00897B', arrowColor: '#00897B' }}
          />
        </View>
      </ScrollView>

      {/* Events Modal */}
      <Modal visible={showEventsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upcoming Events</Text>
              <TouchableOpacity onPress={() => setShowEventsModal(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            {events.length === 0 ? (
              <Text style={styles.emptyModalText}>No upcoming events</Text>
            ) : (
              <FlatList
                data={events}
                keyExtractor={(item, idx) => (item.id ? item.id.toString() : `event-${idx}`)}
                renderItem={renderEventItem}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Holidays Modal */}
      <Modal visible={showHolidaysModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Philippine Holidays</Text>
              <TouchableOpacity onPress={() => setShowHolidaysModal(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            {holidays.length === 0 ? (
              <Text style={styles.emptyModalText}>No upcoming holidays</Text>
            ) : (
              <FlatList
                data={holidays}
                keyExtractor={item => item.id}
                renderItem={renderHolidayItem}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Date Details Modal */}
      <Modal visible={showDateModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Events on {selectedDate}</Text>
              <TouchableOpacity onPress={() => setShowDateModal(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedDateEvents}
              keyExtractor={(item, idx) => (item.id ? item.id.toString() : `date-${idx}`)}
              renderItem={renderDateItem}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.emptyModalText}>No events or holidays</Text>}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  holidayButton: {
    borderColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00897B',
  },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 15, marginBottom: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  emptyModalText: { textAlign: 'center', color: '#94A3B8', marginTop: 30 },
  modalEventCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00897B',
  },
  modalEventTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  modalDetailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  modalDetailText: { color: '#4B5563', fontSize: 13 },
  modalEventDesc: { marginTop: 8, color: '#6B7280', fontSize: 12, fontStyle: 'italic' },
  modalHolidayCard: {
    backgroundColor: '#FFF9F0',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  modalHolidayName: { fontSize: 16, fontWeight: '700', color: '#991B1B', marginBottom: 4 },
  modalHolidayDate: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  modalHolidayBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  modalHolidayBadgeText: { fontSize: 10, fontWeight: '700', color: '#DC2626' },
});