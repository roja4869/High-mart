import React from 'react';
import { useForm } from 'react-hook-form';
import { Building, Hash, FileText, MapPin, Compass } from 'lucide-react';

const BusinessDetails = ({ defaultValues, onNext, onPrev }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || {}
  });

  const onSubmit = (data) => {
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="seller-step-form">
      <h3 className="step-title">Step 2: Business Details</h3>
      <p className="step-description">Provide your registered company information and physical location details.</p>

      <div className="form-grid">
        {/* Business Name */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="businessName">Registered Business Name *</label>
          <div className="input-with-icon">
            <Building size={18} className="input-icon" />
            <input
              id="businessName"
              type="text"
              placeholder="High Mart Enterprises Pvt Ltd"
              className={`form-input ${errors.businessName ? 'input-error' : ''}`}
              {...register('businessName', { required: 'Business Name is required' })}
            />
          </div>
          {errors.businessName && <span className="error-text">{errors.businessName.message}</span>}
        </div>

        {/* GST Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="gstNumber">GSTIN (GST Number) *</label>
          <div className="input-with-icon">
            <Hash size={18} className="input-icon" />
            <input
              id="gstNumber"
              type="text"
              placeholder="22AAAAA1111A1Z1"
              className={`form-input uppercase-input ${errors.gstNumber ? 'input-error' : ''}`}
              style={{ textTransform: 'uppercase' }}
              {...register('gstNumber', {
                required: 'GST Number is required',
                pattern: {
                  value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                  message: 'Must be a valid 15-character GSTIN (e.g. 22AAAAA1111A1Z1)'
                }
              })}
            />
          </div>
          {errors.gstNumber && <span className="error-text">{errors.gstNumber.message}</span>}
        </div>

        {/* PAN Number */}
        <div className="form-group">
          <label className="form-label" htmlFor="panNumber">Business PAN *</label>
          <div className="input-with-icon">
            <FileText size={18} className="input-icon" />
            <input
              id="panNumber"
              type="text"
              placeholder="ABCDE1234F"
              className={`form-input uppercase-input ${errors.panNumber ? 'input-error' : ''}`}
              style={{ textTransform: 'uppercase' }}
              {...register('panNumber', {
                required: 'PAN Number is required',
                pattern: {
                  value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                  message: 'Must be a valid 10-character PAN (e.g. ABCDE1234F)'
                }
              })}
            />
          </div>
          {errors.panNumber && <span className="error-text">{errors.panNumber.message}</span>}
        </div>

        {/* Business Address */}
        <div className="form-group full-width">
          <label className="form-label" htmlFor="businessAddress">Registered Office Address *</label>
          <div className="input-with-icon">
            <MapPin size={18} className="input-icon" />
            <input
              id="businessAddress"
              type="text"
              placeholder="Flat 102, Innovation Blocks, Tech Corridor"
              className={`form-input ${errors.businessAddress ? 'input-error' : ''}`}
              {...register('businessAddress', { required: 'Business Address is required' })}
            />
          </div>
          {errors.businessAddress && <span className="error-text">{errors.businessAddress.message}</span>}
        </div>

        {/* City */}
        <div className="form-group">
          <label className="form-label" htmlFor="city">City *</label>
          <div className="input-with-icon">
            <Compass size={18} className="input-icon" />
            <input
              id="city"
              type="text"
              placeholder="Bengaluru"
              className={`form-input ${errors.city ? 'input-error' : ''}`}
              {...register('city', { required: 'City is required' })}
            />
          </div>
          {errors.city && <span className="error-text">{errors.city.message}</span>}
        </div>

        {/* State */}
        <div className="form-group">
          <label className="form-label" htmlFor="state">State *</label>
          <div className="input-with-icon">
            <Compass size={18} className="input-icon" />
            <input
              id="state"
              type="text"
              placeholder="Karnataka"
              className={`form-input ${errors.state ? 'input-error' : ''}`}
              {...register('state', { required: 'State is required' })}
            />
          </div>
          {errors.state && <span className="error-text">{errors.state.message}</span>}
        </div>

        {/* Pincode */}
        <div className="form-group">
          <label className="form-label" htmlFor="pincode">Pincode *</label>
          <div className="input-with-icon">
            <Hash size={18} className="input-icon" />
            <input
              id="pincode"
              type="text"
              placeholder="560001"
              className={`form-input ${errors.pincode ? 'input-error' : ''}`}
              {...register('pincode', {
                required: 'Pincode is required',
                pattern: {
                  value: /^[1-9][0-9]{5}$/,
                  message: 'Must be a valid 6-digit Pincode (e.g. 560001)'
                }
              })}
            />
          </div>
          {errors.pincode && <span className="error-text">{errors.pincode.message}</span>}
        </div>
      </div>

      <div className="step-actions-footer">
        <button type="button" onClick={onPrev} className="wizard-btn-secondary">
          <span>Previous</span>
        </button>
        <button type="submit" className="wizard-btn-primary">
          <span>Continue</span>
        </button>
      </div>
    </form>
  );
};

export default BusinessDetails;
