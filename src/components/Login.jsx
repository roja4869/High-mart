import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { authService } from '../services/authService';
import { Mail, Lock, Eye, EyeOff, ShoppingBag } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { addToast, syncCart, setCurrentUser } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
 
  // Error States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
 
  // Check Remembered Email on Mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('highMartRememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);
 
  const validateEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.toLowerCase().trim());
  };
 
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
 
    // Reset Errors
    setEmailError('');
    setPasswordError('');
 
    // Email checks
    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }
 
    // Password checks
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }
 
    if (!isValid) {
      addToast('Please resolve validation errors.', 'error');
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 450);
      return;
    }
 
    // Attempt Login
    setIsLoading(true);
    try {
      const data = await authService.login(email, password);
      
      // Save/remove remember me email
      if (rememberMe) {
        localStorage.setItem('highMartRememberedEmail', email.trim());
      } else {
        localStorage.removeItem('highMartRememberedEmail');
      }

      const from = location.state?.from?.pathname || '/dashboard';

      setCurrentUser(data.user);
      addToast(data.message || 'Login successful!', 'success');
      if (syncCart) {
        await syncCart();
      }
      
      // Redirect to dashboard/admin panel based on role
      setTimeout(() => {
        setIsLoading(false);
        if (data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      addToast(err.message || 'Invalid email or password.', 'error');
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 450);
    }
  };
 
  // Quick Demo Access Login
  const handleQuickLogin = async (roleType) => {
    setIsLoading(true);
    try {
      const emailVal = roleType === 'admin' ? 'admin@example.com' : 'jane@example.com';
      const passVal = roleType === 'admin' ? 'admin123' : 'password123';
      const data = await authService.login(emailVal, passVal);
      setCurrentUser(data.user);
      addToast(data.message || 'Quick login successful!', 'success');
      
      if (syncCart) {
        await syncCart();
      }
      
      setTimeout(() => {
        setIsLoading(false);
        if (roleType === 'admin') {
          navigate('/admin');
        } else {
          navigate(from, { replace: true });
        }
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      addToast(err.message || 'Demo login failed.', 'error');
    }
  };

  // Mock social logins
  const handleSocialClick = (platform) => {
    addToast(`Connecting with ${platform} gateway...`, 'info');
    setTimeout(() => {
      addToast(`${platform} OAuth gateway connected.`, 'success');
    }, 1000);
  };

  return (
    <div className="login-page-wrapper section-padding">
      <div className="login-container">
        {/* Left Banner Section */}
        <div className="login-banner-panel">
          <img src="/assets/shopping_banner.png" alt="High Mart Login Banner" className="login-banner-img" />
          <div className="login-banner-overlay">
            <div className="login-banner-info animate-fade-in">
              <div className="banner-badge">Secure Portal</div>
              <h1>Welcome Back <br/><span className="highlight-color">High Mart Shopper</span></h1>
              <p>Sign in to unlock customized shopping suggestions, retrieve saved products, and execute payments in seconds.</p>
              
              <div className="banner-list">
                <div className="banner-item">
                  <span className="chk-icon">&#10004;</span>
                  <span>Access Cart & Wishlist Sync</span>
                </div>
                <div className="banner-item">
                  <span className="chk-icon">&#10004;</span>
                  <span>Track Active Order Logistics</span>
                </div>
                <div className="banner-item">
                  <span className="chk-icon">&#10004;</span>
                  <span>Members-Only Pricing Events</span>
                </div>
              </div>
            </div>
            <div className="login-banner-foot">
              <p>&copy; 2026 High Mart Inc.</p>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="login-form-panel">
          <div className={`login-form-card glass-effect ${shakeCard ? 'shake-animation' : ''}`}>
            <div className="card-logo-header">
              <div className="logo-box">
                <ShoppingBag size={22} className="logo-icon-svg" />
              </div>
              <span className="logo-txt">High Mart</span>
            </div>

            <div className="welcome-headline">
              <h2>Account Sign In</h2>
              <p>Please enter your email and password to log in</p>
            </div>

            <form onSubmit={handleLoginSubmit} novalidate>
              {/* Email Address */}
              <div className="input-field-group">
                <label htmlFor="email">Email Address</label>
                <div className={`input-field-box ${emailError ? 'error-state' : ''}`}>
                  <span className="field-icon"><Mail size={16} /></span>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    autoComplete="email"
                  />
                </div>
                {emailError && <div className="error-txt-msg">{emailError}</div>}
              </div>

              {/* Password */}
              <div className="input-field-group">
                <label htmlFor="password">Password</label>
                <div className={`input-field-box ${passwordError ? 'error-state' : ''}`}>
                  <span className="field-icon"><Lock size={16} /></span>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    autoComplete="current-password"
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
                {passwordError && <div className="error-txt-msg">{passwordError}</div>}
              </div>

              {/* Remember and Forgot Options */}
              <div className="form-settings-row">
                <label className="remember-me-checkbox">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="chk-custom"></span>
                  <span className="chk-lbl">Remember me</span>
                </label>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    addToast(email ? `Password recovery link dispatched to ${email}.` : 'Please fill in your email address first.', email ? 'success' : 'info');
                  }} 
                  className="forgot-password-anchor"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <button 
                type="submit" 
                className={`login-submit-btn ${isLoading ? 'btn-loader-active' : ''}`}
                disabled={isLoading}
              >
                <span className="btn-txt-label">Sign In</span>
                <div className="btn-spin-wheel"></div>
              </button>
            </form>

            <div className="or-auth-divider">
              <span>or sign in with</span>
            </div>

            {/* Social Logins */}
            <div className="social-auth-row">
              <button 
                type="button" 
                onClick={() => handleSocialClick('Google')} 
                className="social-auth-btn"
                aria-label="Google Auth Login"
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
                aria-label="Facebook Auth Login"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            {/* Quick Demo Logins */}
            <div className="demo-accounts-container">
              <div className="demo-headline">Quick Demo Access</div>
              <div className="demo-accounts-row">
                <button 
                  type="button" 
                  onClick={() => handleQuickLogin('user')} 
                  className="demo-login-btn user-demo-btn"
                  disabled={isLoading}
                >
                  <span>Customer Portal</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleQuickLogin('admin')} 
                  className="demo-login-btn admin-demo-btn"
                  disabled={isLoading}
                >
                  <span>Admin Panel</span>
                </button>
              </div>
            </div>

            <div className="login-card-foot">
              <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
