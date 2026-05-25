import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ChatPanel.css';
import {
  X, Send, Plus, ArrowLeft, MessageCircle, Search, Users, Trash2, LogOut
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const ChatPanel = ({ token }) => {
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [myUserId, setMyUserId] = useState(null);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [unreadMap, setUnreadMap] = useState({});

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Group
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');

  // Delete / Leave modals
  const [showDeleteRoomModal, setShowDeleteRoomModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [showLeaveRoomModal, setShowLeaveRoomModal] = useState(false);
  const [roomToLeave, setRoomToLeave] = useState(null);

  // ------------------------------------------------------
  // Fetch unread counts from the server (per room)
  // ------------------------------------------------------
  const fetchUnreadCounts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat/unread-counts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const map = {};
      let total = 0;
      data.forEach(r => {
        map[r.room_id] = r.unread || 0;
        total += r.unread || 0;
      });
      setUnreadMap(map);
      setUnreadTotal(total);
    } catch (err) {
      console.error('Failed to fetch unread counts', err);
    }
  }, [token]);

  // ------------------------------------------------------
  // WebSocket & Auth
  // ------------------------------------------------------
  useEffect(() => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setMyUserId(payload.id);
    } catch (e) {}

    fetchUnreadCounts();

    const ws = new WebSocket(`ws://localhost:5000?token=${token}`);
    wsRef.current = ws;
    ws.onopen = () => console.log('Chat WS open');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        setMessages((prev) => [...prev, data.message]);
        if (!open) {
          // Increase unread for that room locally
          setUnreadMap(prev => ({
            ...prev,
            [data.message.room_id]: (prev[data.message.room_id] || 0) + 1
          }));
          setUnreadTotal(prev => prev + 1);
        }
      }
    };
    ws.onclose = () => console.log('Chat WS closed');
    return () => ws.close();
  }, [token, open, fetchUnreadCounts]);

  // Periodic refresh of unread counts
  useEffect(() => {
    const interval = setInterval(fetchUnreadCounts, 10000);
    return () => clearInterval(interval);
  }, [fetchUnreadCounts]);

  // Reset unread for rooms when panel opens (mark all as read)
  useEffect(() => {
    if (open) {
      rooms.forEach(room => {
        fetch(`${API_BASE}/api/chat/read/${room.id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      });
      setUnreadMap({});
      setUnreadTotal(0);
    }
  }, [open, rooms, token]);

  // ------------------------------------------------------
  // Fetch rooms & users
  // ------------------------------------------------------
  const fetchRooms = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/chat/rooms`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setRooms(data || []);
  }, [token]);

  useEffect(() => { if (token) fetchRooms(); }, [token, fetchRooms]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/employees`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAllUsers(data || []))
      .catch(console.error);
  }, [token]);

  // Search filtering
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setFilteredUsers([]);
      setShowSearchResults(false);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = allUsers.filter(u =>
      u.full_name.toLowerCase().includes(lower) && u.id !== myUserId
    );
    setFilteredUsers(filtered);
    setShowSearchResults(true);
  }, [searchTerm, allUsers, myUserId]);

  // Record read when entering a room
  useEffect(() => {
    if (!activeRoom) return;
    fetch(`${API_BASE}/api/chat/read/${activeRoom.id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(console.error);
    // Refresh unread counts to update badge/room list
    fetchUnreadCounts();
  }, [activeRoom, token, fetchUnreadCounts]);

  // Fetch history when room changes
  useEffect(() => {
    if (!activeRoom) return;
    fetch(`${API_BASE}/api/chat/history/${activeRoom.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(data || []))
      .catch(console.error);
  }, [activeRoom, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ------------------------------------------------------
  // Chat actions
  // ------------------------------------------------------
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

  const startDM = async (partner) => {
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
    setShowSearchResults(false);
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) {
      alert('Group name and at least one other member are required.');
      return;
    }
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
      fetchRooms();
      setShowGroupModal(false);
      setGroupName('');
      setSelectedUsers([]);
      setGroupSearch('');
    } else {
      alert('Failed to create group');
    }
  };

  const deleteRoom = async (roomId) => {
    const res = await fetch(`${API_BASE}/api/chat/rooms/${roomId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (activeRoom?.id === roomId) setActiveRoom(null);
    }
  };

  const leaveRoom = async (roomId) => {
    const res = await fetch(`${API_BASE}/api/chat/rooms/${roomId}/leave`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setRooms(prev => prev.filter(r => r.id !== roomId));
      if (activeRoom?.id === roomId) setActiveRoom(null);
    }
  };

  const togglePanel = () => setOpen(!open);

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------
  return (
    <>
      {!open && (
        <button className="chat-toggle-btn" onClick={togglePanel}>
          <MessageCircle size={20} /> Chat
          {unreadTotal > 0 && <span className="unread-badge">{unreadTotal}</span>}
        </button>
      )}

      {open && (
        <div className="chat-panel">
          {!activeRoom ? (
            <div className="chat-room-list">
              <div className="chat-header">
                <h3>Messages</h3>
                <button onClick={togglePanel}><X size={20} /></button>
              </div>

              {/* Search bar */}
              <div className="chat-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search for a user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => searchTerm && setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                {showSearchResults && filteredUsers.length > 0 && (
                  <div className="search-results">
                    {filteredUsers.map(user => (
                      <div key={user.id} className="search-result-item" onMouseDown={() => startDM(user)}>
                        <span>{user.full_name}</span>
                        <small>{user.role}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Room list */}
              <div className="room-groups">
                {rooms.length === 0 && (
                  <p className="empty-rooms">No conversations yet. Search for a user above.</p>
                )}
                {rooms.map(room => {
                  const isGroup = room.type === 'group';
                  const displayName = isGroup ? room.name : (room.display_name || 'Unknown');
                  const unread = unreadMap[room.id] || 0;
                  return (
                    <div
                      key={room.id}
                      className={`room-item ${unread > 0 ? 'room-unread' : ''}`}
                      onClick={() => setActiveRoom(room)}
                    >
                      <div className="room-info">
                        <span className="room-name">{displayName}</span>
                        <span className="room-type">{isGroup ? 'Group Chat' : 'Direct Message'}</span>
                      </div>
                      {unread > 0 && <span className="room-unread-badge">{unread}</span>}
                      <div className="room-actions">
                        {isGroup && (
                          <button title="Leave" onClick={(e) => { e.stopPropagation(); setRoomToLeave(room); setShowLeaveRoomModal(true); }}>
                            <LogOut size={14} />
                          </button>
                        )}
                        {isGroup ? (
                          <button title="Delete" onClick={(e) => { e.stopPropagation(); setRoomToDelete(room); setShowDeleteRoomModal(true); }}>
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button title="Delete" onClick={(e) => { e.stopPropagation(); setRoomToDelete(room); setShowDeleteRoomModal(true); }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="new-group-btn" onClick={() => setShowGroupModal(true)}>
                <Plus size={18} /> Create Group
              </button>
            </div>
          ) : (
            <div className="chat-room">
              <div className="chat-room-header">
                <button onClick={() => setActiveRoom(null)}><ArrowLeft size={20} /></button>
                <span className="room-title">
                  {activeRoom.type === 'group' ? activeRoom.name : (activeRoom.display_name || activeRoom.name)}
                </span>
              </div>

              <div className="chat-messages">
                {messages.map(msg => {
                  const isSent = msg.user_id === myUserId;
                  return (
                    <div key={msg.id} className={`message-bubble ${isSent ? 'sent' : 'received'}`}>
                      <div className="msg-sender">{msg.full_name || msg.employee_id || 'You'}</div>
                      <div className="msg-text">{msg.message}</div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-bar">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend} className="send-btn"><Send size={18} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Group creation modal */}
      {showGroupModal && (
        <div className="modal-overlay">
          <div className="dm-modal-content" style={{ maxWidth: '450px', width: '95%' }}>
            <h3>Create Group Chat</h3>
            <input placeholder="Group name" value={groupName} onChange={e => setGroupName(e.target.value)} />
            <input placeholder="Search members..." value={groupSearch} onChange={e => setGroupSearch(e.target.value)} />
            <div className="member-list">
              {allUsers
                .filter(u => u.full_name.toLowerCase().includes(groupSearch.toLowerCase()) && u.id !== myUserId)
                .map(u => (
                  <div key={u.id} className="member-item" onClick={() => {
                    setSelectedUsers(prev => prev.some(s => s.id === u.id) ? prev.filter(s => s.id !== u.id) : [...prev, u]);
                  }}>
                    <input type="checkbox" checked={selectedUsers.some(s => s.id === u.id)} readOnly />
                    <span>{u.full_name} ({u.role})</span>
                  </div>
                ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowGroupModal(false)}>Cancel</button>
              <button onClick={createGroup}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete room modal */}
      {showDeleteRoomModal && (
        <div className="modal-overlay">
          <div className="dm-modal-content">
            <h3>Delete {roomToDelete?.type === 'group' ? 'Group' : 'Conversation'}</h3>
            <p>Do you want to permanently delete "{roomToDelete?.display_name || roomToDelete?.name}"?</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteRoomModal(false)}>Cancel</button>
              <button onClick={() => { deleteRoom(roomToDelete.id); setShowDeleteRoomModal(false); }} style={{ background: '#EF4444', color: 'white' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Leave room modal */}
      {showLeaveRoomModal && (
        <div className="modal-overlay">
          <div className="dm-modal-content">
            <h3>Leave Group</h3>
            <p>You will no longer receive messages from "{roomToLeave?.name}".</p>
            <div className="modal-actions">
              <button onClick={() => setShowLeaveRoomModal(false)}>Cancel</button>
              <button onClick={() => { leaveRoom(roomToLeave.id); setShowLeaveRoomModal(false); }} style={{ background: '#F59E0B', color: 'white' }}>Leave</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPanel;