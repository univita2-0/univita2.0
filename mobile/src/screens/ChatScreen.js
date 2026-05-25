import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, Modal, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'http://10.0.2.2:5000'; // change for real devices

export default function ChatScreen() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [token, setToken] = useState('');
  const [myUserId, setMyUserId] = useState(null);
  const wsRef = useRef(null);
  const flatListRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [unreadCounts, setUnreadCounts] = useState({});

  // ---- Initial auth & data ----
  useEffect(() => {
    AsyncStorage.getItem('auth_token').then((t) => {
      setToken(t);
      fetchRooms(t);
      fetchAllUsers(t);
      fetchUnreadCounts(t);
    });
    AsyncStorage.getItem('user_id').then(id => setMyUserId(parseInt(id)));
  }, []);

  const fetchRooms = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/rooms`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      setRooms(data || []);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  const fetchAllUsers = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/api/employees`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      setAllUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchUnreadCounts = async (authToken) => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/unread-counts`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      const counts = {};
      data.forEach(r => { counts[r.room_id] = r.unread; });
      setUnreadCounts(counts);
    } catch (err) {
      console.error('Error fetching unread counts:', err);
    }
  };

  // ---- WebSocket connection ----
  useEffect(() => {
    if (!token || !activeRoom) return;
    const ws = new WebSocket(`ws://10.0.2.2:5000?token=${token}`);
    wsRef.current = ws;
    ws.onopen = () => console.log('Mobile chat WS open');
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'new_message') {
        setMessages((prev) => [...prev, data.message]);
        fetchUnreadCounts(token);
      }
    };
    ws.onerror = (e) => console.error('WS error:', e.message);
    ws.onclose = () => console.log('Mobile chat WS closed');
    return () => ws.close();
  }, [token, activeRoom]);

  // Record reading when room becomes active
  useEffect(() => {
    if (!activeRoom || !token) return;
    fetch(`${API_BASE}/api/chat/read/${activeRoom.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(console.error);
    fetchUnreadCounts(token);
  }, [activeRoom, token]);

  // Fetch message history on room change
  useEffect(() => {
    if (!activeRoom || !token) return;
    fetch(`${API_BASE}/api/chat/history/${activeRoom.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(data || []))
      .catch(console.error);
  }, [activeRoom, token]);

  // ---- Send message (this is the missing function) ----
  const handleSend = () => {
    if (!newMsg.trim() || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: 'message',
      roomId: activeRoom.id,
      roomName: activeRoom.name,
      content: newMsg.trim()
    }));
    setNewMsg('');
  };

  // ---- Start DM ----
  const startDM = async (partner) => {
    try {
      const dmRes = await fetch(`${API_BASE}/api/chat/dm-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ partnerUserId: partner.id })
      });
      const dmData = await dmRes.json();
      if (dmData.roomId) {
        const newRoom = {
          id: dmData.roomId,
          name: dmData.roomName,
          display_name: partner.full_name,
          type: 'direct'
        };
        setRooms(prev => [newRoom, ...prev.filter(r => r.id !== newRoom.id)]);
        setActiveRoom(newRoom);
      }
      setSearchTerm('');
      setShowUserList(false);
    } catch (err) {
      Alert.alert('Error', 'Could not start conversation.');
    }
  };

  // ---- Create group ----
  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) {
      Alert.alert('Error', 'Group name and at least 2 members are required.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/chat/group-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: groupName, memberIds: selectedUsers.map(u => u.id) })
      });
      const data = await res.json();
      if (data.success) {
        fetchRooms(token);
        setShowGroupModal(false);
        setGroupName('');
        setSelectedUsers([]);
        setGroupSearch('');
      } else {
        Alert.alert('Error', data.error || 'Failed to create group');
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
  };

  // ---- Leave / Delete room ----
  const leaveRoom = async (roomId) => {
    try {
      await fetch(`${API_BASE}/api/chat/rooms/${roomId}/leave`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (activeRoom?.id === roomId) setActiveRoom(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to leave group');
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await fetch(`${API_BASE}/api/chat/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (activeRoom?.id === roomId) setActiveRoom(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to delete group');
    }
  };

  // ---- Filter users ----
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers([]);
      setShowUserList(false);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = allUsers.filter(u =>
      u.full_name.toLowerCase().includes(lower) && u.id !== myUserId
    );
    setFilteredUsers(filtered);
    setShowUserList(true);
  }, [searchTerm, allUsers, myUserId]);

  // ---- Render functions ----
  const renderRoom = ({ item }) => {
    const isGroup = item.type === 'group';
    const displayName = isGroup ? item.name : (item.display_name || item.name);
    const unread = unreadCounts[item.id] || 0;
    return (
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() => setActiveRoom(item)}
        onLongPress={() => {
          if (isGroup) {
            Alert.alert(displayName, 'Choose an action', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Leave Group', onPress: () => leaveRoom(item.id) },
              { text: 'Delete Group', style: 'destructive', onPress: () => deleteRoom(item.id) }
            ]);
          } else {
            Alert.alert('Delete Conversation', `Delete your conversation with ${displayName}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteRoom(item.id) }
            ]);
          }
        }}
      >
        <View style={styles.roomRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.roomName}>{displayName}</Text>
            <Text style={styles.roomType}>{isGroup ? 'Group' : 'Direct Message'}</Text>
          </View>
          {unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unread}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }) => {
    const isSent = item.user_id === myUserId;
    return (
      <View style={[styles.messageBubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={[styles.sender, isSent && styles.sentSender]}>{item.full_name || 'User'}</Text>
        <Text style={[styles.messageText, isSent && styles.sentMessageText]}>{item.message}</Text>
      </View>
    );
  };

  if (!token) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {!activeRoom ? (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Chat</Text>
            <TouchableOpacity style={styles.newGroupButton} onPress={() => setShowGroupModal(true)}>
              <Text style={styles.newGroupText}>+ Group</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              onFocus={() => searchTerm.length > 0 && setShowUserList(true)}
              onBlur={() => setTimeout(() => setShowUserList(false), 200)}
            />
          </View>

          {showUserList && filteredUsers.length > 0 && (
            <View style={styles.userListContainer}>
              {filteredUsers.map(user => (
                <TouchableOpacity key={user.id} style={styles.userItem} onPress={() => startDM(user)}>
                  <Text style={styles.userName}>{user.full_name}</Text>
                  <Text style={styles.userRole}>{user.role}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <FlatList
            data={rooms}
            keyExtractor={item => item.id.toString()}
            renderItem={renderRoom}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No conversations yet.</Text>
                <Text style={styles.emptySubtext}>Search for a user above to start chatting.</Text>
              </View>
            }
          />
        </>
      ) : (
        <>
          <View style={styles.roomHeader}>
            <TouchableOpacity onPress={() => setActiveRoom(null)}>
              <Text style={styles.backBtn}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.roomTitle}>
              {activeRoom.type === 'group'
                ? activeRoom.name
                : (activeRoom.display_name || activeRoom.name)}
            </Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id.toString()}
            renderItem={renderMessage}
            style={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              value={newMsg}
              onChangeText={setNewMsg}
              placeholder="Type message..."
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
              <Text style={{ color: 'white' }}>Send</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Group creation modal */}
      <Modal visible={showGroupModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Group Chat</Text>
            <TextInput style={styles.modalInput} placeholder="Group name" value={groupName} onChangeText={setGroupName} />
            <TextInput style={styles.modalInput} placeholder="Search members..." value={groupSearch} onChangeText={setGroupSearch} />
            <ScrollView style={styles.memberList}>
              {allUsers.filter(u => u.full_name.toLowerCase().includes(groupSearch.toLowerCase()) && u.id !== myUserId).map(u => (
                <TouchableOpacity key={u.id} style={styles.memberItem} onPress={() => {
                  setSelectedUsers(prev => prev.some(s => s.id === u.id) ? prev.filter(s => s.id !== u.id) : [...prev, u]);
                }}>
                  <Text style={{ flex: 1 }}>{u.full_name} ({u.role})</Text>
                  {selectedUsers.some(s => s.id === u.id) && <Text style={{ color: '#00897B' }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowGroupModal(false)} style={styles.cancelBtn}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createGroup} style={styles.startBtn}>
                <Text style={styles.startBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  header: { fontSize: 20, fontWeight: 'bold' },
  newGroupButton: { backgroundColor: '#00897B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  newGroupText: { color: 'white', fontWeight: '600' },
  searchBar: { paddingHorizontal: 16, paddingBottom: 8 },
  searchInput: { backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, borderWidth: 1, borderColor: '#e2e8f0' },
  userListContainer: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, marginHorizontal: 16, marginBottom: 8, maxHeight: 200 },
  userItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  userName: { fontSize: 15, fontWeight: '500' },
  userRole: { fontSize: 13, color: '#64748b' },
  roomItem: { paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  roomRow: { flexDirection: 'row', alignItems: 'center' },
  roomName: { fontSize: 16, fontWeight: '600' },
  roomType: { fontSize: 12, color: '#64748b', marginTop: 2 },
  unreadBadge: { backgroundColor: '#00897B', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  unreadText: { color: 'white', fontSize: 12, fontWeight: '700' },
  roomHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#00897B' },
  backBtn: { color: 'white', marginRight: 12 },
  roomTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  messageList: { flex: 1, padding: 10, backgroundColor: '#f0f0f0' },
  messageBubble: { padding: 10, marginBottom: 8, borderRadius: 8, maxWidth: '80%' },
  receivedBubble: { backgroundColor: 'white', alignSelf: 'flex-start' },
  sentBubble: { backgroundColor: '#00897B', alignSelf: 'flex-end' },
  sender: { fontWeight: 'bold', marginBottom: 4, color: '#00897B' },
  sentSender: { color: '#B2DFDB' },
  messageText: { color: '#1e293b' },
  sentMessageText: { color: 'white' },
  inputArea: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#ddd' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 12, marginRight: 8 },
  sendBtn: { backgroundColor: '#00897B', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 12, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12 },
  memberList: { maxHeight: 150, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 5 },
  memberItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  cancelBtn: { padding: 10, marginRight: 10 },
  startBtn: { backgroundColor: '#00897B', padding: 10, borderRadius: 8 },
  startBtnText: { color: 'white', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 16, color: '#64748b', fontWeight: '600' },
  emptySubtext: { fontSize: 14, color: '#94a3b8', marginTop: 4 }
});