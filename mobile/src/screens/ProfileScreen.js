// src/screens/ProfileScreen.js – Updated: Removed biometric setup
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import {
  User,
  Mail,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  ArrowLeft,
  Bell
  // Fingerprint removed
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // User Data State (biometricEnabled removed)
  const [userData, setUserData] = useState({
    id: '',
    name: 'Loading...',
    email: 'loading@gmail.com',
    daysSinceChange: 0
  });

  // Form States
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const id = await AsyncStorage.getItem('user_id');
        const name = await AsyncStorage.getItem('user_name');
        const email = await AsyncStorage.getItem('user_email');
        const days = await AsyncStorage.getItem('days_since_change');
        setUserData({
          id: id || '',
          name: name || 'Employee',
          email: email || 'user@hct.com',
          daysSinceChange: parseInt(days) || 0
        });
        setEditName(name || '');
        setEditEmail(email || '');
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.clear();
          navigation.replace('Login');
        },
        style: 'destructive'
      }
    ]);
  };

  const handleUpdateProfile = async () => {
    if (!editName || !editEmail) return Alert.alert("Error", "Fields cannot be empty");
    setLoading(true);
    try {
      await AsyncStorage.setItem('user_name', editName);
      await AsyncStorage.setItem('user_email', editEmail);
      setUserData({ ...userData, name: editName, email: editEmail });
      Alert.alert("Success", "Profile updated successfully");
      setShowEditModal(false);
    } catch (err) {
      Alert.alert("Error", "Could not update profile information.");
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = 365 - userData.daysSinceChange;

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, badge }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: '#E0F2F1' }]}>
        <Icon size={20} color="#00796B" />
      </View>
      <View style={{ flex: 1, marginLeft: 15 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      {badge && <Text style={styles.badge}>{badge}</Text>}
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account settings</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={40} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{userData.name}</Text>
            <Text style={styles.email}>{userData.email}</Text>
            <Text style={[styles.expiryText, { color: daysRemaining < 30 ? '#FCA5A5' : '#E4E4E7' }]}>
              Password expires in: {daysRemaining} days
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon={User}
            title="Edit Profile"
            subtitle="Update your information"
            onPress={() => setShowEditModal(true)}
          />
          <View style={styles.divider} />
          <MenuItem
            icon={Shield}
            title="Security"
            subtitle="Password and authentication"
            onPress={() => navigation.navigate('Security')}
          />
          <View style={styles.divider} />
          {/* Biometric Setup removed */}
          <MenuItem
            icon={Bell}
            title="Emergency Alerts"
            subtitle="View active alerts"
            onPress={() => navigation.navigate('Alerts')}
          />
        </View>

        <Text style={styles.sectionHeader}>Support</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon={HelpCircle}
            title="Help Center"
            subtitle="FAQs and support"
            onPress={() => Alert.alert("Support", "Contact: help@hctacademy.com")}
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <ArrowLeft size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
            </View>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput style={styles.input} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnOutline} onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalBtnTextOutline}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnFill} onPress={handleUpdateProfile} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnTextFill}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { padding: 20 },
  header: { marginTop: 40, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280' },
  profileCard: {
    backgroundColor: '#52525B', borderRadius: 16, padding: 20, marginBottom: 25,
    flexDirection: 'row', alignItems: 'center'
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: 'white'
  },
  name: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  email: { color: '#E4E4E7', fontSize: 14 },
  expiryText: { fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  sectionHeader: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 10, marginLeft: 5 },
  menuCard: { backgroundColor: 'white', borderRadius: 12, padding: 5, marginBottom: 20, elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuTitle: { fontSize: 16, fontWeight: '500', color: '#111827' },
  menuSub: { fontSize: 12, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 70 },
  badge: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: '600',
    color: '#00796B',
    marginRight: 8
  },
  logoutBtn: {
    backgroundColor: '#EF4444', padding: 15, borderRadius: 8, alignItems: 'center',
    marginTop: 10, marginBottom: 30, flexDirection: 'row', justifyContent: 'center'
  },
  logoutText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  modalContent: {
    backgroundColor: 'white', borderRadius: 20, padding: 25,
    width: '100%', maxWidth: 400, elevation: 5
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8, color: '#374151' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 15, marginTop: 10 },
  modalBtnOutline: { flex: 1, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  modalBtnFill: { flex: 1, backgroundColor: '#00796B', padding: 15, borderRadius: 8, alignItems: 'center' },
  modalBtnTextOutline: { color: '#374151', fontWeight: '600' },
  modalBtnTextFill: { color: 'white', fontWeight: '600' },
});