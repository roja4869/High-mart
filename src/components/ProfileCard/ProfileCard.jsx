import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Camera, Edit3, Save, X, User, Mail, Phone, Calendar, ShieldAlert, Award } from 'lucide-react';
import defaultAvatar from '../../assets/profile-avatar.png';
import { authService } from '../../services/authService';

const ProfileCard = ({ user, onUpdateUser, addToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    bio: 'Avid shopper & review contributor'
  });
  
  const [avatar, setAvatar] = useState(defaultAvatar);
  const fileInputRef = useRef(null);

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || 'Male',
        dob: user.dob || '1995-08-15',
        bio: user.bio || 'Avid shopper & review contributor'
      });
      if (user.avatar) {
        setAvatar(user.avatar);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('Avatar image must be less than 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        setAvatar(reader.result);
        if (user) {
          const updatedUser = { ...user, avatar: reader.result };
          try {
            const token = localStorage.getItem('highMartToken');
            if (token) {
              const res = await axios.put('/api/auth/profile', { avatar: reader.result }, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.data && res.data.success) {
                localStorage.setItem('highMartUser', JSON.stringify(res.data.user));
                onUpdateUser(res.data.user);
                addToast('Profile picture updated on server!', 'success');
                return;
              }
            }
            localStorage.setItem('highMartUser', JSON.stringify(updatedUser));
            onUpdateUser(updatedUser);
            addToast('Profile picture updated successfully!', 'success');
          } catch (err) {
            console.warn("Failed to sync avatar with backend:", err.message);
            localStorage.setItem('highMartUser', JSON.stringify(updatedUser));
            onUpdateUser(updatedUser);
            addToast('Profile picture updated locally.', 'success');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Name is required.', 'error');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    try {
      const res = await authService.updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dob: formData.dob,
        bio: formData.bio.trim()
      });

      if (res && res.success) {
        onUpdateUser(res.user);
        setIsEditing(false);
        addToast('Profile details saved to database!', 'success');
      } else {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('highMartUser', JSON.stringify(updatedUser));
        onUpdateUser(updatedUser);
        setIsEditing(false);
        addToast('Profile saved locally.', 'success');
      }
    } catch (err) {
      console.warn("Failed to update profile in DB:", err.message);
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('highMartUser', JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
      setIsEditing(false);
      addToast('Profile details saved locally (DB connection error).', 'warning');
    }
  };

  return (
    <div className="profile-card-container">
      {/* Profile Header Card */}
      <div className="profile-header-widget glass-effect">
        <div className="profile-header-avatar-sec">
          <div className="profile-avatar-wrapper" onClick={triggerFileInput}>
            <img src={avatar} alt={formData.name || 'User Avatar'} className="profile-avatar-img" />
            <div className="avatar-hover-overlay">
              <Camera size={20} />
              <span>Change</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleAvatarChange} 
            />
          </div>
          <div className="profile-header-meta">
            <div className="profile-name-badge-row">
              <h2>{formData.name || 'Shopper'}</h2>
              <span className="membership-badge">
                <Award size={13} />
                <span>Premium Member</span>
              </span>
            </div>
            <p className="profile-bio-text">"{formData.bio}"</p>
            <p className="profile-email-text">{formData.email}</p>
          </div>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="profile-edit-trigger-btn">
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Personal Info Card */}
      <div className="personal-info-widget glass-effect">
        <div className="widget-header">
          <User size={18} className="widget-icon" />
          <h3>Personal Details</h3>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="profile-edit-form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon-left" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon-left" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Mobile Number</label>
                <div className="input-with-icon">
                  <Phone size={16} className="input-icon-left" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon-left" />
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="bio">Profile Tagline / Bio</label>
                <input
                  type="text"
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  if (user) {
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      gender: user.gender || 'Male',
                      dob: user.dob || '1995-08-15',
                      bio: user.bio || 'Avid shopper & review contributor'
                    });
                    if (user.avatar) setAvatar(user.avatar);
                  }
                }} 
                className="btn-cancel"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button type="submit" className="btn-save">
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="personal-details-grid">
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{formData.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{formData.email || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Mobile Number</span>
              <span className="detail-value">{formData.phone ? `+91 ${formData.phone}` : 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Gender</span>
              <span className="detail-value">{formData.gender || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date of Birth</span>
              <span className="detail-value">
                {formData.dob ? new Date(formData.dob).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Account Verification</span>
              <span className="detail-value text-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldAlert size={14} style={{ color: 'var(--color-success)' }} />
                <span>Verified User</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
