import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../App';
import { Shield, Eye, Bell, Lock, Globe, Moon, Sun, KeyRound } from 'lucide-react';

const SettingsPanel = () => {
  const { theme, toggleTheme, addToast } = useContext(AppContext);

  // Load configuration from localstorage or default
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('highMartNotifSettings');
    return saved ? JSON.parse(saved) : { email: true, sms: false, push: true };
  });

  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem('highMartPrivacySettings');
    return saved ? JSON.parse(saved) : { publicProfile: false, personalize: true, history: true };
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('highMartLanguage') || 'English';
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Save when changed
  useEffect(() => {
    localStorage.setItem('highMartNotifSettings', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('highMartPrivacySettings', JSON.stringify(privacy));
  }, [privacy]);

  const handleNotifToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    addToast('Notification preferences updated!', 'success');
  };

  const handlePrivacyToggle = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    addToast('Privacy preferences updated!', 'success');
  };

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    setLanguage(val);
    localStorage.setItem('highMartLanguage', val);
    addToast(`Language changed to ${val}!`, 'success');
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      addToast('Please fill out all password fields.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('Confirm password does not match new password.', 'error');
      return;
    }

    addToast('Password successfully updated!', 'success');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="settings-panel-container">
      {/* Dark Mode & Theme settings */}
      <div className="settings-widget glass-effect">
        <div className="widget-header">
          <Moon size={18} className="widget-icon" />
          <h3>Appearance Settings</h3>
        </div>
        <div className="appearance-settings-row">
          <div className="settings-meta-desc">
            <h5>Dark Mode</h5>
            <p>Switch between light and dark themes for optimal viewing comfort.</p>
          </div>
          <button onClick={toggleTheme} className={`theme-toggle-switch ${theme === 'dark' ? 'active' : ''}`} aria-label="Toggle Dark Mode">
            <span className="switch-slider">
              {theme === 'dark' ? <Moon size={12} className="switch-icon-slider" /> : <Sun size={12} className="switch-icon-slider" />}
            </span>
          </button>
        </div>
      </div>

      {/* Language Selection */}
      <div className="settings-widget glass-effect">
        <div className="widget-header">
          <Globe size={18} className="widget-icon primary" />
          <h3>Language & Region</h3>
        </div>
        <div className="language-settings-row">
          <div className="settings-meta-desc">
            <h5>Default Language</h5>
            <p>Select your preferred language for emails and dashboard labels.</p>
          </div>
          <select value={language} onChange={handleLanguageChange} className="language-dropdown-select">
            <option value="English">English (United States)</option>
            <option value="Spanish">Spanish (Español)</option>
            <option value="French">French (Français)</option>
            <option value="Hindi">Hindi (हिन्दी)</option>
            <option value="Japanese">Japanese (日本語)</option>
          </select>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="settings-widget glass-effect">
        <div className="widget-header">
          <Bell size={18} className="widget-icon success" />
          <h3>Notification Preferences</h3>
        </div>
        <div className="toggles-list-container">
          <div className="toggle-setting-row">
            <div className="toggle-text-meta">
              <h5>Email Alerts</h5>
              <p>Receive order updates, receipt invoices, and promotions via email.</p>
            </div>
            <button 
              onClick={() => handleNotifToggle('email')} 
              className={`toggle-switch-btn ${notifications.email ? 'on' : ''}`}
              aria-label="Toggle Email Alerts"
            >
              <span className="toggle-circle"></span>
            </button>
          </div>

          <div className="toggle-setting-row">
            <div className="toggle-text-meta">
              <h5>SMS Messages</h5>
              <p>Get fast SMS alerts for shipping status and delivery updates.</p>
            </div>
            <button 
              onClick={() => handleNotifToggle('sms')} 
              className={`toggle-switch-btn ${notifications.sms ? 'on' : ''}`}
              aria-label="Toggle SMS Messages"
            >
              <span className="toggle-circle"></span>
            </button>
          </div>

          <div className="toggle-setting-row">
            <div className="toggle-text-meta">
              <h5>Push Notifications</h5>
              <p>Receive live web notifications for deals and instant cart alerts.</p>
            </div>
            <button 
              onClick={() => handleNotifToggle('push')} 
              className={`toggle-switch-btn ${notifications.push ? 'on' : ''}`}
              aria-label="Toggle Push Notifications"
            >
              <span className="toggle-circle"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="settings-widget glass-effect">
        <div className="widget-header">
          <Shield size={18} className="widget-icon accent" />
          <h3>Privacy & Data</h3>
        </div>
        <div className="toggles-list-container">
          <div className="toggle-setting-row">
            <div className="toggle-text-meta">
              <h5>Public Profile</h5>
              <p>Allow other shoppers to view your review history and public wishlist.</p>
            </div>
            <button 
              onClick={() => handlePrivacyToggle('publicProfile')} 
              className={`toggle-switch-btn ${privacy.publicProfile ? 'on' : ''}`}
              aria-label="Toggle Public Profile"
            >
              <span className="toggle-circle"></span>
            </button>
          </div>

          <div className="toggle-setting-row">
            <div className="toggle-text-meta">
              <h5>Personalized Recommendations</h5>
              <p>Allow High Mart to curate deals based on your browsing history.</p>
            </div>
            <button 
              onClick={() => handlePrivacyToggle('personalize')} 
              className={`toggle-switch-btn ${privacy.personalize ? 'on' : ''}`}
              aria-label="Toggle Personalized Recommendations"
            >
              <span className="toggle-circle"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Security: Change Password */}
      <div className="settings-widget glass-effect">
        <div className="widget-header">
          <Lock size={18} className="widget-icon error" />
          <h3>Security & Password</h3>
        </div>
        <form onSubmit={handlePasswordSubmit} className="change-password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <div className="input-with-icon">
              <KeyRound size={16} className="input-icon-left" />
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon-left" />
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="At least 6 characters"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon-left" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Must match new password"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-update-password">
            <span>Update Password</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPanel;
