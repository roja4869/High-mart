import React from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

const PersonalDetails = ({ defaultValues, onNext }) => {
  const { register, handleSubmit, formState: { errors }, watch, getValues } = useForm({
    defaultValues: defaultValues || {}
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="seller-step-form">
      <h3 className="step-title">Step 1: Personal Details</h3>
      <p className="step-description">Please enter your personal contact and login credentials.</p>

      <div className="form-grid">
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Full Name *</label>
          <div className="input-with-icon">
            <User size={18} className="input-icon" />
            <input
              id="fullName"
              type="text"
              placeholder="John Doe"
              className={`form-input ${errors.fullName ? 'input-error' : ''}`}
              {...register('fullName', { required: 'Full Name is required' })}
            />
          </div>
          {errors.fullName && <span className="error-text">{errors.fullName.message}</span>}
        </div>

        {/* Email Address */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address *</label>
          <div className="input-with-icon">
            <Mail size={18} className="input-icon" />
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address format'
                }
              })}
            />
          </div>
          {errors.email && <span className="error-text">{errors.email.message}</span>}
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Phone Number *</label>
          <div className="input-with-icon">
            <Phone size={18} className="input-icon" />
            <input
              id="phone"
              type="tel"
              placeholder="9876543210"
              className={`form-input ${errors.phone ? 'input-error' : ''}`}
              {...register('phone', {
                required: 'Phone Number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Phone number must be a valid 10-digit number'
                }
              })}
            />
          </div>
          {errors.phone && <span className="error-text">{errors.phone.message}</span>}
        </div>

        {/* Empty space to balance grid */}
        <div className="form-group hide-on-mobile"></div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="password">Password *</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters long'
                }
              })}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <span className="error-text">{errors.password.message}</span>}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
          <div className="input-with-icon">
            <Lock size={18} className="input-icon" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === getValues('password') || 'Passwords do not match'
              })}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
        </div>
      </div>

      <div className="step-actions-footer">
        <button type="submit" className="wizard-btn-primary">
          <span>Continue</span>
        </button>
      </div>
    </form>
  );
};

export default PersonalDetails;
