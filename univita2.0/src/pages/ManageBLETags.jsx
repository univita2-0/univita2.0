import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Plus, Trash2 } from 'lucide-react';
import { API_BASE } from '../api';
import './ManageBLETags.css';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
});

const ManageBLETags = () => {
  const [bleTags, setBleTags] = useState([]);
  const [newBleId, setNewBleId] = useState('');
  const [newBleLabel, setNewBleLabel] = useState('');
  const [newBleMac, setNewBleMac] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBleTags = async () => {
    try {
      const res = await axios.get(`${API_BASE}/ble-tags`, getAuthHeaders());
      setBleTags(res.data || []);
    } catch (err) { toast.error('Failed to load tags'); }
  };

  useEffect(() => { fetchBleTags(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/ble-tags`, 
        { ble_id: newBleId, label: newBleLabel, mac_address: newBleMac }, 
        getAuthHeaders()
      );
      toast.success('Tag added');
      setNewBleId(''); setNewBleLabel(''); setNewBleMac('');
      fetchBleTags();
    } catch (err) { toast.error('Failed to add tag'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tag?')) return;
    try {
      await axios.delete(`${API_BASE}/ble-tags/${id}`, getAuthHeaders());
      toast.success('Tag deleted');
      fetchBleTags();
    } catch (err) { toast.error('Delete failed'); }
  };

  return (
    <div className="manage-tags-container">
      <div className="manage-tags-card">
        <h3>Register New BLE Tag</h3>
        <form onSubmit={handleAdd} className="tag-form">
          <input placeholder="BLE ID (e.g., BLE-3F-01)" value={newBleId} onChange={e => setNewBleId(e.target.value)} required />
          <input placeholder="Label (e.g., Beacon 1)" value={newBleLabel} onChange={e => setNewBleLabel(e.target.value)} />
          <input placeholder="MAC Address" value={newBleMac} onChange={e => setNewBleMac(e.target.value)} required />
          <button type="submit" disabled={loading}><Plus size={16} /> Add Tag</button>
        </form>

        <table className="tags-table">
          <thead><tr><th>ID</th><th>Label</th><th>MAC Address</th><th>Action</th></tr></thead>
          <tbody>
            {bleTags.map(tag => (
              <tr key={tag.id}>
                <td>{tag.ble_id}</td>
                <td>{tag.label}</td>
                <td>{tag.mac_address}</td>
                <td><button className="btn-del" onClick={() => handleDelete(tag.id)}><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageBLETags;