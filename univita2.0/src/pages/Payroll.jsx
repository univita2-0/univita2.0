// src/pages/Payroll.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Payroll.css';
import { Lock } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../api';

const Payroll = ({ onUnlock, adminEmail }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [locked, setLocked] = useState(false);

  const handleUnlock = async () => {
    if (!code.trim()) {
      toast.warning('Please enter your security code.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/payroll/unlock`, {
        email: adminEmail,
        pin: code
      });
      if (res.data.success) {
        onUnlock(res.data.token);
      } else {
        toast.error(res.data.message);
        if (res.data.message.includes('Too many failed attempts')) {
          setLocked(true);
          setTimeout(() => setLocked(false), 15 * 60 * 1000);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payroll-container">
      <div className="payroll-card">
        <div className="lock-icon-wrapper">
          <Lock size={36} color="white" strokeWidth={1.5} />
        </div>
        <h2 className="payroll-title">Payroll Access Restricted</h2>
        <p className="payroll-text">
          This area contains sensitive financial information. Please enter your security code to continue.
        </p>
        <div style={{ width: '100%', maxWidth: '400px', textAlign: 'left' }}>
          <label className="security-label">Security Code</label>
          <input
            type="password"
            className="security-input"
            value={code}
            maxLength={6}
            disabled={locked}
            placeholder={locked ? 'Too many attempts. Wait 15 min.' : 'Enter code'}
            onChange={(e) => { setCode(e.target.value); }}
          />
        </div>
        <button className="btn-unlock" onClick={handleUnlock} disabled={loading || locked}>
          {loading ? 'Verifying...' : 'UNLOCK'}
        </button>
      </div>
    </div>
  );
};

export default Payroll;