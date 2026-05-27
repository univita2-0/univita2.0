// src/screens/ProfileScreen.js
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
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  ArrowLeft,
  Bell,
  Edit2
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    id: '',
    name: 'Loading...',
    email: 'loading@gmail.com',
    daysSinceChange: 0
  });

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
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconBox}>
        <Icon size={20} color="#00897B" />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSub}>{subtitle}</Text>
      </View>
      {badge && <Text style={styles.badge}>{badge}</Text>}
      <ChevronRight size={18} color="#94A3B8" />
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Avatar */}
          <View style={styles.headerSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={40} color="#00897B" />
              </View>
              <TouchableOpacity style={styles.editAvatarBtn} onPress={() => setShowEditModal(true)}>
                <Edit2 size={14} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            <View style={styles.expiryBadge}>
              <Text style={styles.expiryText}>
                Password expires in {daysRemaining} days
              </Text>
            </View>
          </View>

          {/* Menu Sections */}
          <View style={styles.menuSection}>
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
              <MenuItem
                icon={Bell}
                title="Emergency Alerts"
                subtitle="View active alerts"
                onPress={() => navigation.navigate('Alerts')}
              />
            </View>
          </View>

          <View style={styles.menuSection}>
            <Text style={styles.sectionHeader}>Support</Text>
            <View style={styles.menuCard}>
              <MenuItem
                icon={HelpCircle}
                title="Help Center"
                subtitle="FAQs and support"
                onPress={() => Alert.alert("Support", "Contact: help@hctacademy.com")}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <LogOut size={18} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Edit Profile Modal */}
        <Modal visible={showEditModal} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <ArrowLeft size={22} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <View style={{ width: 22 }} />
              </View>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94A3B8"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalBtnOutline} onPress={() => setShowEditModal(false)}>
                  <Text style={styles.modalBtnTextOutline}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtnFill} onPress={handleUpdateProfile} disabled={loading}>
                  {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.modalBtnTextFill}>Save Changes</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

// ---------- MODERN STYLES ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  headerSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00897B',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  expiryBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#D97706',
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 10,
    fontWeight: '700',
    color: '#00897B',
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 56,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 40,
    marginTop: 16,
    marginBottom: 20,
    gap: 10,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtnOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalBtnFill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 40,
    backgroundColor: '#00897B',
    alignItems: 'center',
  },
  modalBtnTextOutline: {
    color: '#334155',
    fontWeight: '600',
  },
  modalBtnTextFill: {
    color: 'white',
    fontWeight: '600',
  },
});