import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { authService } from '../services/authService';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import './Register.css';

const Register = () => {
  const { addToast } = useContext(AppContext);
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Toggle Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Strength State
  const [strengthScore, setStrengthScore] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('-');
  const [showStrengthMeter, setShowStrengthMeter] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);

  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '-' };
    
    if (pass.length >= 8) score++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    let label = 'Weak';
    if (score <= 1) label = 'Weak';
    else if (score <= 3) label = 'Medium';
    else label = 'Strong';

    return { score, label };
  };

  const handlePasswordInput = (e) => {
    const val = e.target.value;
    setPassword(val);
    
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }

    if (!val) {
      setShowStrengthMeter(false);
      return;
    }

    setShowStrengthMeter(true);
    const { score, label } = calculatePasswordStrength(val);
    setStrengthScore(score);
    setStrengthLabel(label);
  };

  const handlePhoneInput = (e) => {
    // Keep numbers only
    const val = e.target.value.replace(/\D/g, '');
    setPhone(val);
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) tempErrors.name = 'Full Name is required.';
    
    if (!email.trim()) {
      tempErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.toLowerCase().trim())) {
      tempErrors.email = 'Please enter a valid email address.';
    }

    if (!phone.trim()) {
      tempErrors.phone = 'Mobile Number is required.';
    } else if (phone.trim().length !== 10) {
      tempErrors.phone = 'Mobile Number must be exactly 10 digits.';
    }

    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters.';
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Please confirm your password.';
    } else if (confirmPassword !== password) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      tempErrors.agreeTerms = 'You must agree to the Terms & Conditions.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();

    if (!isValid) {
      addToast('Please resolve validation errors.', 'error');
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 450);
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.register(name, email, phone, password);
      addToast(data.message || 'Registration successful! Redirecting to Login...', 'success');
      
      // Navigate to Login after 2 seconds
      setTimeout(() => {
        setIsLoading(false);
        navigate('/login');
      }, 2000);
    } catch (err) {
      setIsLoading(false);
      addToast(err.message || 'Registration failed.', 'error');
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 450);
    }
  };

  const handleSocialClick = (platform) => {
    addToast(`Connecting with ${platform} signup gateway...`, 'info');
    setTimeout(() => {
      addToast(`${platform} Account linked.`, 'success');
    }, 1000);
  };

  return (
    <div className="login-page-wrapper section-padding">
      <div className="login-container">
        {/* Left Banner Panel */}
        <div className="login-banner-panel">
          <img src="/assets/register_banner.png" alt="High Mart Customer Banner" className="login-banner-img" />
          <div className="login-banner-overlay">
            <div className="login-banner-info animate-fade-in">
              <div className="banner-badge">Account Sign Up</div>
              <h1>Unlock Premium <br/><span class="highlight-color">Shopping Perks</span></h1>
              <p>Create your shopping credentials now. Experience exclusive vouchers, early holiday sales, and express tracking services.</p>
              
              <div className="banner-list">
                <div className="banner-item">
                  <span className="chk-icon">&#10004;</span>
                  <span>15% Signup Discount Code</span>
                </div>
                <div className="banner-item">
                  <span className="chk-icon">&#10004;</span>
                  <span>Zero-Cost Priority Shipment Options</span>
                </div>
                <div className="banner-item">
                  <span className="chk-icon">&#10004;</span>
                  <span>24/7 Dedicated Client Services</span>
                </div>
              </div>
            </div>
            <div className="login-banner-foot">
              <p>&copy; 2026 High Mart Inc.</p>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-form-panel">
          <div className={`login-form-card glass-effect ${shakeCard ? 'shake-animation' : ''}`}>
            <div className="card-logo-header">
              <div className="logo-box">
                <ShoppingBag size={22} className="logo-icon-svg" />
              </div>
              <span className="logo-txt">High Mart</span>
            </div>

            <div className="welcome-headline">
              <h2>Join High Mart</h2>
              <p>Provide your shopping details to register</p>
            </div>

            <form onSubmit={handleRegisterSubmit} novalidate>
              {/* Full Name */}
              <div className="input-field-group">
                <label htmlFor="fullName">Full Name</label>
                <div className={`input-field-box ${errors.name ? 'error-state' : ''}`}>
                  <span className="field-icon"><User size={16} /></span>
                  <input 
                    type="text" 
                    id="fullName" 
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    autoComplete="name"
                  />
                </div>
                {errors.name && <div className="error-txt-msg">{errors.name}</div>}
              </div>

              {/* Email Address */}
              <div className="input-field-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-field-box ${errors.email ? 'error-state' : ''}`}>
                  <span className="field-icon"><Mail size={16} /></span>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <div className="error-txt-msg">{errors.email}</div>}
              </div>

              {/* Mobile Number */}
              <div className="input-field-group">
                <label htmlFor="mobile">Mobile Number</label>
                <div className={`input-field-box ${errors.phone ? 'error-state' : ''}`}>
                  <span className="field-icon"><Phone size={16} /></span>
                  <input 
                    type="tel" 
                    id="mobile" 
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={phone}
                    onChange={handlePhoneInput}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && <div className="error-txt-msg">{errors.phone}</div>}
              </div>

              {/* Password */}
              <div className="input-field-group">
                <label htmlFor="password">Password</label>
                <div className={`input-field-box ${errors.password ? 'error-state' : ''}`}>
                  <span className="field-icon"><Lock size={16} /></span>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={handlePasswordInput}
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    className="eye-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle Password Eye"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                {/* Strength Meter */}
                {showStrengthMeter && (
                  <div className="password-strength-container animate-fade-in">
                    <div className="strength-bar-wrapper">
                      <div className={`strength-segment ${strengthScore >= 1 ? (strengthScore <= 1 ? 'weak' : strengthScore <= 3 ? 'medium' : 'strong') : ''}`}></div>
                      <div className={`strength-segment ${strengthScore >= 2 ? (strengthScore <= 3 ? 'medium' : 'strong') : ''}`}></div>
                      <div className={`strength-segment ${strengthScore >= 4 ? 'strong' : ''}`}></div>
                    </div>
                    <div className="strength-text-label">
                      <span>Password Strength:</span>
                      <span className={strengthLabel.toLowerCase()}>{strengthLabel}</span>
                    </div>
                  </div>
                )}
                {errors.password && <div className="error-txt-msg">{errors.password}</div>}
              </div>

              {/* Confirm Password */}
              <div className="input-field-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={`input-field-box ${errors.confirmPassword ? 'error-state' : ''}`}>
                  <span className="field-icon"><Lock size={16} /></span>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    id="confirmPassword" 
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    className="eye-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle Confirm Eye"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <div className="error-txt-msg">{errors.confirmPassword}</div>}
              </div>

              {/* Agree Terms */}
              <div className="form-settings-row" style={{ margin: '8px 0 16px 0' }}>
                <label className="remember-me-checkbox">
                  <input 
                    type="checkbox" 
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.agreeTerms) setErrors(prev => ({ ...prev, agreeTerms: '' }));
                    }}
                  />
                  <span className="chk-custom"></span>
                  <span className="chk-lbl" style={{ fontSize: '13px' }}>
                    I agree to the <a href="#" onClick={(e) => { e.preventDefault(); addToast('Terms & Conditions details loaded.', 'info'); }} style={{ color: 'var(--primary-color)' }}>Terms & Conditions</a>
                  </span>
                </label>
              </div>
              {errors.agreeTerms && <div className="error-txt-msg" style={{ marginTop: '-12px', marginBottom: '16px' }}>{errors.agreeTerms}</div>}

              {/* Submit Button */}
              <button 
                type="submit" 
                className={`login-submit-btn ${isLoading ? 'btn-loader-active' : ''}`}
                disabled={isLoading}
              >
                <span className="btn-txt-label">Register Account</span>
                <div className="btn-spin-wheel"></div>
              </button>
            </form>

            <div className="or-auth-divider">
              <span>or sign up with</span>
            </div>

            {/* Social Logins */}
            <div className="social-auth-row">
              <button 
                type="button" 
                onClick={() => handleSocialClick('Google')} 
                className="social-auth-btn"
                aria-label="Google signup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24c0-1.63-.15-3.2-.43-4.75H24v9h12.75c-.55 2.89-2.18 5.33-4.63 7l7.19 5.56C43.5 36.33 46.5 30.73 46.5 24z"/>
                  <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.19-5.56c-2 .54-4.59.87-8.7 8.7-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Google</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleSocialClick('Facebook')} 
                className="social-auth-btn"
                aria-label="Facebook signup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            <div className="login-card-foot">
              <p>Already have an account? <Link to="/login">Login</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
