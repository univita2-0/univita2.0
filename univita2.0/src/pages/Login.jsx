// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { login } from '../api';
import { API_BASE } from '../api';
import './Login.css';

const Login = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const startResendTimer = () => {
    setResendTimer(60);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setOtpLoading(true);

    try {
      const result = await login({ email, password });

      if (result.success) {
        if (result.requiresPasswordReset) {
          toast.error('Your password has expired. Please use the mobile app to reset it.');
          setOtpLoading(false);
          return;
        }

        // Send OTP
        const otpRes = await fetch(`${API_BASE}/auth/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const otpData = await otpRes.json();

        if (otpData.success) {
          setStep('otp');
          startResendTimer();
        } else {
          toast.error(otpData.message || 'Failed to send OTP.');
        }
      } else {
        toast.error(result.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error. Please ensure the backend server is running.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (data.success) {
        // Block instructors from web portal
        if (data.user.role === 'instructor') {
          toast.error('Instructor accounts cannot log in to the web portal. Please use the UniVITA mobile app.');
          setStep('login');
          setOtp('');
          return;
        }

        // Store the JWT token (critical for authenticated API calls)
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_id', data.user.id);
        localStorage.setItem('user_name', data.user.full_name);
        localStorage.setItem('user_role', data.user.role);
        localStorage.setItem('user_email', data.user.email);
        localStorage.setItem('employee_id', data.user.employee_id);

        window.location.href = '/';
      } else {
        toast.error(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error. Please ensure the backend server is running.');
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        startResendTimer();
      } else {
        toast.error(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button className="back-button" onClick={onBack}>
        ← Back to Appointment Portal
      </button>

      <div className="login-card">
        {step === 'login' ? (
          <>
            <h1 className="welcome-title">Welcome to Admin Portal</h1>
            <p className="login-instruction">Login to access your account</p>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="forgot-link">
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.875rem', padding: '10px 0' }}
                >
                  Forgot Password?
                </button>
              </div>
              <button type="submit" className="login-btn" disabled={otpLoading}>
                {otpLoading ? 'Sending OTP...' : 'Login'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="welcome-title">Check Your Email</h1>
            <p className="login-instruction">
              We sent a 6‑digit OTP to <strong>{email}</strong>. It expires in 5 minutes.
            </p>

            <form onSubmit={handleVerifyOtp}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter 6‑digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <button type="submit" className="login-btn">
                Verify OTP
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem' }}>
              {resendTimer > 0 ? (
                <span style={{ color: '#64748b' }}>Resend OTP in {resendTimer}s</span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  {otpLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                onClick={() => { setStep('login'); setOtp(''); }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ← Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;