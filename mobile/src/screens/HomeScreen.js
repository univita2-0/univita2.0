import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView,
  Alert, RefreshControl, Modal, TextInput, Image, Dimensions, Platform, StatusBar
} from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import axios from 'axios';

import {
  clockIn, clockOut, fetchAttendanceHistory, fetchUserSchedule,
  syncOfflineQueue, fetchEmergencyAlerts, markAlertAsRead, requestAttendanceCorrection
} from './api';
import ChatScreen from './ChatScreen';
import { API_URL } from './api';

import {
  Bell, Clock, MapPin, X, MessageCircle, CheckCircle, XCircle,
  AlertCircle, TrendingUp, FileText, User, Camera, CalendarDays, Award
} from 'lucide-react-native';

const LOCATION_TASK_NAME = 'background-location-task';

// ------------------- BACKGROUND TASK (unchanged) -------------------
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  console.log("🔁 Background task fired at", new Date().toLocaleTimeString());
  if (error) {
    console.error("Background Location Error:", error);
    return;
  }
  if (data && data.locations && data.locations.length > 0) {
    const location = data.locations[0];
    console.log("📍 Background location received", location.coords);
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      console.warn("No internet – skipping sync");
      return;
    }
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.warn("No auth token");
        return;
      }
      const schedule = await AsyncStorage.getItem('today_schedule');
      const parsed = schedule ? JSON.parse(schedule) : null;
      const url = `${API_URL}/instructor/location`;
      console.log("Pinging URL:", url);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          location_enabled: true,
          location_name: parsed?.place || "Background Tracking"
        })
      });
      if (!response.ok) {
        const text = await response.text();
        console.error("Location ping failed:", response.status, text);
      } else {
        console.log("✅ Background ping sent");
      }
    } catch (err) {
      console.error("Background fetch error:", err);
    }
  } else {
    console.log("Background task triggered but no location data");
  }
});

const disableBatteryOptimization = async () => {
  if (Platform.OS === 'android') {
    try {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
      );
    } catch (err) {
      console.log("Couldn't open battery settings", err);
    }
  }
};

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isLargeDevice = width > 428;

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState({ id: null, name: "Employee", employeeId: "", full_name: "" });
  const [refreshing, setRefreshing] = useState(false);
  const [todaySchedule, setTodaySchedule] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({
    canClockIn: true, canClockOut: false, todayRecord: null
  });
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, overtime: 0 });
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionDate, setCorrectionDate] = useState('');
  const [correctionType, setCorrectionType] = useState('clock_in');
  const [correctionTime, setCorrectionTime] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionSelfie, setCorrectionSelfie] = useState(null);
  const [submittingCorrection, setSubmittingCorrection] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertQueue, setAlertQueue] = useState([]);
  const hasSynced = useRef(false);

  // Dynamic greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // ---------- BACKGROUND TRACKING (unchanged) ----------
  useEffect(() => {
    let isMounted = true;
    const initBackgroundTracking = async () => {
      try {
        const { status: fg } = await Location.requestForegroundPermissionsAsync();
        const { status: bg } = await Location.requestBackgroundPermissionsAsync();
        if (fg !== 'granted' || bg !== 'granted') {
          console.warn("Location permissions not fully granted");
          return;
        }
        const { status: notif } = await Notifications.requestPermissionsAsync();
        if (notif !== 'granted') {
          console.warn("Notification permission not granted – background service may be killed sooner.");
        }
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (isRegistered) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          console.log("Cleared old background task...");
        }
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 20000,
          distanceInterval: 0,
          deferredUpdatesInterval: 20000,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "UniVITA Tracking Active",
            notificationBody: "Monitoring location for shift compliance.",
            notificationColor: "#059669",
          },
        });
        if (isMounted) console.log("✅ Background location tracking started");
        if (Platform.OS === 'android') {
          await disableBatteryOptimization();
        }
      } catch (err) {
        console.error("Failed to start background tracking:", err);
      }
    };
    initBackgroundTracking();
    return () => { isMounted = false; };
  }, []);

  const testManualPing = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission needed");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/instructor/location`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          location_enabled: true,
          location_name: "Manual Test"
        })
      });
      const result = await response.json();
      Alert.alert("Manual Ping", result.success ? "Success" : "Failed: " + JSON.stringify(result));
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // ---------- All existing functions (unchanged) ----------
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const captureSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Camera permission needed'); return null; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    return !result.canceled ? result.assets[0].uri : null;
  };
  const performClockAction = async (type) => {
    if (!todaySchedule) return Alert.alert("Cannot Clock", "No schedule for today.");
    const selfieUri = await captureSelfie();
    if (!selfieUri) return Alert.alert('Selfie Required', 'Please take a selfie.');
    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    try {
      const formData = new FormData();
      formData.append('employee_id', user.employeeId);
      formData.append('latitude', location.coords.latitude.toString());
      formData.append('longitude', location.coords.longitude.toString());
      formData.append('location_enabled', type === 'in' ? 'true' : 'false');
      formData.append('schedule_id', todaySchedule.id);
      const filename = selfieUri.split('/').pop();
      formData.append('selfie', { uri: selfieUri, name: filename, type: 'image/jpeg' });
      const result = type === 'in' ? await clockIn(formData) : await clockOut(formData);
      if (result.success) {
        Alert.alert('Success', result.message);
        await loadData();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) { Alert.alert('Network Error', 'Connection failed.'); }
  };
  const handleClockIn = () => performClockAction('in');
  const handleClockOut = () => performClockAction('out');
  const submitCorrection = async () => {
    if (!correctionDate || !correctionTime || !correctionReason.trim()) return Alert.alert('Required', 'Please fill all fields.');
    const selfieUri = correctionSelfie || await captureSelfie();
    if (!selfieUri) return Alert.alert('Selfie Required', 'Please take a selfie.');
    setSubmittingCorrection(true);
    try {
      const formData = new FormData();
      formData.append('employee_id', user.employeeId);
      formData.append('date', correctionDate);
      formData.append('type', correctionType);
      formData.append('time', correctionTime);
      formData.append('reason', correctionReason.trim());
      formData.append('selfie', { uri: selfieUri, name: 'correction.jpg', type: 'image/jpeg' });
      const result = await requestAttendanceCorrection(formData);
      if (result.success) {
        Alert.alert('Success', 'Request submitted.');
        setShowCorrectionModal(false);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (err) { Alert.alert('Error', 'Network error.'); }
    finally { setSubmittingCorrection(false); }
  };
  const loadData = useCallback(async () => {
    try {
      const rawUser = await AsyncStorage.getItem('user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        const empId = parsed.employee_id;
        setUser({ ...parsed, employeeId: empId });
        const schedule = await fetchUserSchedule(empId);
        const todayStr = new Date().toLocaleDateString('en-CA');
        const now = new Date();
        const currentTimeStr = now.toTimeString().split(' ')[0];
        const todaySchedules = schedule.filter(s => s.date === todayStr);
        let activeSchedule = todaySchedules.find(s => currentTimeStr >= s.start_time && currentTimeStr <= s.end_time);
        if (!activeSchedule) {
          activeSchedule = todaySchedules.find(s => s.start_time > currentTimeStr) || todaySchedules[todaySchedules.length - 1];
        }
        setTodaySchedule(activeSchedule || null);
        await AsyncStorage.setItem('today_schedule', JSON.stringify(activeSchedule || null));
        const history = await fetchAttendanceHistory(empId);
        calculateStats(history);
        checkTodayStatus(history, activeSchedule);
      }
    } catch (error) {
      console.error("Error loading home data:", error);
    }
  }, []);
  const checkTodayStatus = (history, activeSchedule) => {
    if (!activeSchedule) {
      setAttendanceStatus({ canClockIn: false, canClockOut: false, todayRecord: null });
      return;
    }
    const todayRecord = history.find(record => record.schedule_id === activeSchedule.id);
    if (todayRecord) {
      const isClockedIn = !!todayRecord.time_in;
      const isClockedOut = todayRecord.time_out && todayRecord.time_out !== '--:--';
      setAttendanceStatus({
        canClockIn: false,
        canClockOut: isClockedIn && !isClockedOut,
        todayRecord: { ...todayRecord, time_in: todayRecord.time_in || '--:--', time_out: todayRecord.time_out || '--:--' }
      });
    } else {
      setAttendanceStatus({ canClockIn: true, canClockOut: false, todayRecord: null });
    }
  };
  const calculateStats = (history) => {
    let counts = { present: 0, absent: 0, late: 0, overtime: 0 };
    history.forEach(r => {
      if (r.status === 'present') counts.present++;
      else if (r.status === 'late') counts.late++;
      else if (r.status === 'absent') counts.absent++;
      if (parseFloat(r.total_hours) > 8) counts.overtime++;
    });
    setStats(counts);
  };
  useEffect(() => {
    const loadAlerts = async () => {
      if (!user.id) return;
      try {
        const alerts = await fetchEmergencyAlerts(user.id);
        const unreadAlerts = alerts.filter(a => !a.read_at);
        if (unreadAlerts.length > 0) {
          setAlertQueue(unreadAlerts);
          showNextAlert(unreadAlerts[0]);
        }
      } catch (err) { console.error('Failed to fetch alerts', err); }
    };
    loadAlerts();
  }, [user.id]);
  const showNextAlert = (alert) => {
    setCurrentAlert(alert);
    setShowAlertModal(true);
    if (alert.severity === 'critical') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (alert.severity === 'warning') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  const dismissAlert = async () => {
    if (currentAlert) {
      await markAlertAsRead(currentAlert.id, user.id);
      const newQueue = alertQueue.filter(a => a.id !== currentAlert.id);
      setAlertQueue(newQueue);
      setShowAlertModal(false);
      if (newQueue.length > 0) showNextAlert(newQueue[0]);
    } else setShowAlertModal(false);
  };
  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;
    syncOfflineQueue().then(count => { if (count > 0) Alert.alert("Sync", `${count} records synced.`); });
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) syncOfflineQueue().then(count => { if (count > 0) Alert.alert("Sync", `${count} records synced.`); });
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const fetchUnread = async () => {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/chat/unread-counts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const sum = data.reduce((acc, r) => acc + (r.unread || 0), 0);
        setUnreadCount(sum);
      } catch (e) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const finalCanClockIn = todaySchedule !== null && attendanceStatus.canClockIn;
  const finalCanClockOut = todaySchedule !== null && attendanceStatus.canClockOut;

  // ---------- REDESIGNED RENDER (bolder changes) ----------
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#00897B"]} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with dynamic greeting + avatar */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user.full_name || user.name}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.bellButton} onPress={() => Alert.alert("Notifications", "Coming soon")}>
                <Bell size={22} color="#1E293B" />
                {unreadCount > 0 && <View style={styles.badge} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarButton} onPress={testManualPing}>
                <User size={22} color="#00897B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date & Time – with calendar icon */}
          <View style={styles.dateCard}>
            <CalendarDays size={24} color="#00897B" style={{ marginBottom: 8 }} />
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>

          {/* Schedule Card */}
          <View style={styles.scheduleCard}>
            <Text style={styles.cardLabel}>Today's Schedule</Text>
            {todaySchedule ? (
              <>
                <View style={styles.scheduleTimeRow}>
                  <Clock size={18} color="#00897B" />
                  <Text style={styles.scheduleTime}>
                    {todaySchedule.start_time?.substring(0,5)} – {todaySchedule.end_time?.substring(0,5)}
                  </Text>
                </View>
                <View style={styles.schedulePlaceRow}>
                  <MapPin size={16} color="#00897B" />
                  <Text style={styles.schedulePlace}>{todaySchedule.place}</Text>
                </View>
                <Text style={styles.courseText}>{todaySchedule.course || "General Instruction"}</Text>
              </>
            ) : (
              <Text style={styles.noScheduleText}>No schedule assigned for today</Text>
            )}
          </View>

          {/* Clock In/Out Buttons – outline style for clock out */}
          <View style={styles.clockContainer}>
            <TouchableOpacity
              style={[styles.clockButton, styles.clockInButton, !finalCanClockIn && styles.clockDisabled]}
              onPress={handleClockIn}
              disabled={!finalCanClockIn}
            >
              <Clock size={20} color="white" />
              <Text style={styles.clockButtonText}>Clock In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.clockButton, styles.clockOutButton, !finalCanClockOut && styles.clockDisabled]}
              onPress={handleClockOut}
              disabled={!finalCanClockOut}
            >
              <Clock size={20} color="#00897B" />
              <Text style={[styles.clockButtonText, { color: '#00897B' }]}>Clock Out</Text>
            </TouchableOpacity>
          </View>

          {attendanceStatus.todayRecord && (
            <View style={styles.clockedInChip}>
              <CheckCircle size={14} color="#10B981" />
              <Text style={styles.clockedInText}>
                {(!attendanceStatus.todayRecord.time_out || attendanceStatus.todayRecord.time_out === '--:--')
                  ? `Clocked in at ${attendanceStatus.todayRecord.time_in} for ${todaySchedule?.course || 'your shift'}`
                  : `Shift completed at ${attendanceStatus.todayRecord.time_out}`
                }
              </Text>
            </View>
          )}

          {/* Horizontal scroll stats */}
          <Text style={styles.statsHeader}>Monthly Overview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
            <StatCard icon={<CheckCircle size={20} color="#10B981" />} label="Present" value={stats.present} />
            <StatCard icon={<XCircle size={20} color="#EF4444" />} label="Absent" value={stats.absent} />
            <StatCard icon={<AlertCircle size={20} color="#F59E0B" />} label="Late" value={stats.late} />
            <StatCard icon={<TrendingUp size={20} color="#3B82F6" />} label="Overtime" value={stats.overtime} />
          </ScrollView>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Requests')}>
              <LinearGradient colors={['#E0F2F1', '#B2DFDB']} style={styles.actionIcon}>
                <FileText size={24} color="#00897B" />
              </LinearGradient>
              <Text style={styles.actionTitle}>Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('MyPayroll')}>
              <LinearGradient colors={['#E0F2F1', '#B2DFDB']} style={styles.actionIcon}>
                <TrendingUp size={24} color="#00897B" />
              </LinearGradient>
              <Text style={styles.actionTitle}>Payroll</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Floating Chat Button */}
        <TouchableOpacity style={styles.chatFab} onPress={() => setShowChat(true)}>
          <MessageCircle size={24} color="white" />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Emergency Alert Modal */}
        <Modal visible={showAlertModal} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <LinearGradient
              colors={currentAlert?.severity === 'critical' ? ['#FFF5F5', '#FEE2E2'] : currentAlert?.severity === 'warning' ? ['#FFFBEB', '#FEF3C7'] : ['#FFFFFF', '#F8FAFC']}
              style={styles.alertCard}
            >
              <View style={styles.alertHeader}>
                <Text style={styles.alertTitle}>
                  {currentAlert?.severity === 'critical' ? '🔴 CRITICAL' : currentAlert?.severity === 'warning' ? '🟠 WARNING' : '🔵 INFO'}
                </Text>
              </View>
              <Text style={styles.alertHeading}>{currentAlert?.title}</Text>
              <Text style={styles.alertMessage}>{currentAlert?.message}</Text>
              <View style={styles.alertFooter}>
                <Text style={styles.alertDate}>{currentAlert?.sent_at ? new Date(currentAlert.sent_at).toLocaleString() : ''}</Text>
                <TouchableOpacity style={styles.alertButton} onPress={dismissAlert}>
                  <Text style={styles.alertButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>

        {/* Chat Modal */}
        <Modal visible={showChat} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setShowChat(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.chatHeader}>
              <TouchableOpacity onPress={() => setShowChat(false)}><X size={24} color="#0f172a" /></TouchableOpacity>
              <Text style={styles.chatTitle}>Messages</Text>
              <View style={{ width: 24 }} />
            </View>
            <ChatScreen />
          </SafeAreaView>
        </Modal>

        {/* Attendance Correction Modal */}
        <Modal visible={showCorrectionModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Attendance Correction</Text>
                <TouchableOpacity onPress={() => setShowCorrectionModal(false)}><X size={22} color="#64748B" /></TouchableOpacity>
              </View>
              <ScrollView>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput style={styles.input} value={correctionDate} editable={false} />
                <Text style={styles.inputLabel}>What do you need to correct?</Text>
                <View style={styles.typeGroup}>
                  <TouchableOpacity style={[styles.typeChip, correctionType === 'clock_in' && styles.typeChipActive]} onPress={() => setCorrectionType('clock_in')}>
                    <Text style={[styles.typeChipText, correctionType === 'clock_in' && styles.typeChipTextActive]}>Clock In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.typeChip, correctionType === 'clock_out' && styles.typeChipActive]} onPress={() => setCorrectionType('clock_out')}>
                    <Text style={[styles.typeChipText, correctionType === 'clock_out' && styles.typeChipTextActive]}>Clock Out</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.inputLabel}>Time (HH:MM)</Text>
                <TextInput style={styles.input} placeholder="09:00" value={correctionTime} onChangeText={setCorrectionTime} />
                <Text style={styles.inputLabel}>Reason</Text>
                <TextInput style={[styles.input, styles.textArea]} multiline placeholder="Why did you forget to clock?" value={correctionReason} onChangeText={setCorrectionReason} />
                <Text style={styles.inputLabel}>Selfie (proof)</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={async () => { const uri = await captureSelfie(); if (uri) setCorrectionSelfie(uri); }}>
                  <Camera size={18} color="#0d9488" /><Text style={styles.uploadText}>{correctionSelfie ? 'Retake Selfie' : 'Take Selfie'}</Text>
                </TouchableOpacity>
                {correctionSelfie && <Image source={{ uri: correctionSelfie }} style={styles.previewImage} />}
                <TouchableOpacity style={styles.submitBtn} onPress={submitCorrection} disabled={submittingCorrection}>
                  <Text style={styles.submitBtnText}>{submittingCorrection ? 'Submitting...' : 'Submit Correction Request'}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

// Stat card component
const StatCard = ({ icon, label, value }) => (
  <View style={styles.statCardScroll}>
    <View style={styles.statIconBox}>{icon}</View>
    <Text style={styles.statValueScroll}>{value}</Text>
    <Text style={styles.statLabelScroll}>{label}</Text>
  </View>
);

// ---------- STYLES (distinctly redesigned) ----------
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { paddingHorizontal: 20, paddingBottom: 80, paddingTop: Platform.OS === 'android' ? 8 : 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: { fontSize: 14, fontWeight: '500', color: '#64748B' },
  userName: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bellButton: { padding: 8, position: 'relative' },
  badge: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  avatarButton: { padding: 8, backgroundColor: '#E0F2F1', borderRadius: 30 },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateText: { fontSize: 15, color: '#64748B', fontWeight: '500', marginTop: 8 },
  timeText: { fontSize: 32, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  scheduleTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  scheduleTime: { fontSize: 16, fontWeight: '600', color: '#0F172A' },
  schedulePlaceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  schedulePlace: { fontSize: 15, color: '#334155' },
  courseText: { fontSize: 14, fontWeight: '500', color: '#00897B', marginTop: 4 },
  noScheduleText: { color: '#94A3B8', textAlign: 'center', paddingVertical: 12 },
  clockContainer: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  clockButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 60 },
  clockInButton: { backgroundColor: '#00897B', shadowColor: '#00897B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  clockOutButton: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#00897B' },
  clockDisabled: { opacity: 0.6 },
  clockButtonText: { fontWeight: '700', fontSize: 15, color: 'white' },
  clockedInChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#E0F2F1', paddingVertical: 8, borderRadius: 40, marginBottom: 16 },
  clockedInText: { fontSize: 13, color: '#10B981', fontWeight: '500' },
  statsHeader: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 16 },
  statsScroll: { flexDirection: 'row', marginBottom: 32 },
  statCardScroll: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginRight: 12, width: 100, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  statIconBox: { marginBottom: 8 },
  statValueScroll: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  statLabelScroll: { fontSize: 12, color: '#64748B', marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: 20, marginBottom: 32, justifyContent: 'center' },
  actionItem: { alignItems: 'center', gap: 8, flex: 0.4 },
  actionIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  chatFab: { position: 'absolute', bottom: 30, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#00897B', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
  unreadBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  unreadText: { color: 'white', fontSize: 11, fontWeight: '700' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  chatTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  alertOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertCard: { borderRadius: 28, padding: 24, width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  alertHeader: { marginBottom: 8 },
  alertTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  alertHeading: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#0F172A' },
  alertMessage: { fontSize: 16, color: '#1E293B', marginBottom: 20, lineHeight: 22 },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  alertDate: { fontSize: 11, color: '#64748B' },
  alertButton: { backgroundColor: '#00897B', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 30 },
  alertButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 12, fontSize: 15, backgroundColor: '#F8FAFC' },
  textArea: { height: 90, textAlignVertical: 'top' },
  typeGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  typeChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 30, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: 'white' },
  typeChipActive: { backgroundColor: '#00897B', borderColor: '#00897B' },
  typeChipText: { fontSize: 13, color: '#1E293B' },
  typeChipTextActive: { color: 'white' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F1F5F9', padding: 12, borderRadius: 14, marginTop: 8 },
  uploadText: { color: '#0d9488', fontWeight: '500' },
  previewImage: { width: '100%', height: 180, borderRadius: 14, marginTop: 12 },
  submitBtn: { backgroundColor: '#00897B', padding: 14, borderRadius: 16, alignItems: 'center', marginTop: 24, marginBottom: 20 },
  submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});