import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../App';
import { authService } from '../../services/authService';
import PersonalDetails from './PersonalDetails';
import BusinessDetails from './BusinessDetails';
import BankDetails from './BankDetails';
import DocumentsUpload from './DocumentsUpload';
import ReviewSubmit from './ReviewSubmit';
import './SellerRegister.css';

const STEPS = [
  { id: 1, label: 'Personal Details' },
  { id: 2, label: 'Business Details' },
  { id: 3, label: 'Bank Details' },
  { id: 4, label: 'Upload Documents' },
  { id: 5, label: 'Review & Submit' }
];

const SellerRegister = () => {
  const { setCurrentUser, syncCart, addToast } = useContext(AppContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    gstNumber: '',
    panNumber: '',
    businessAddress: '',
    city: '',
    state: '',
    pincode: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    upiId: '',
    profilePhoto: null,
    gstCertificate: null,
    panCard: null,
    cancelledCheque: null,
    businessLicense: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleNextStep = (stepData) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFormSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      
      // Append fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          // If it's a file, it will be handled as file field, otherwise as text field
          submitData.append(key, formData[key]);
        }
      });

      const response = await axios.post('/api/seller/register', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success) {
        // Trigger success toast
        if (addToast) {
          addToast(response.data.message || 'Application submitted successfully. Waiting for admin approval.', 'success');
        }
        
        // Auto-login the user immediately
        try {
          const loginData = await authService.login(formData.email, formData.password);
          setCurrentUser(loginData.user);
          if (syncCart) {
            await syncCart();
          }
        } catch (loginErr) {
          console.error("Auto-login after registration failed:", loginErr);
        }
        setSuccess(true);
      } else {
        const backendError = response.data.message || response.data.error || 'Registration failed. Please try again.';
        setError(backendError);
        if (addToast) {
          addToast(backendError, 'error');
        }
      }
    } catch (err) {
      console.error('Seller registration submission error:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Server connection error occurred.';
      setError(errMsg);
      if (addToast) {
        addToast(errMsg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderActiveStepComponent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalDetails 
            defaultValues={{
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              password: formData.password,
              confirmPassword: formData.confirmPassword
            }}
            onNext={handleNextStep}
          />
        );
      case 2:
        return (
          <BusinessDetails
            defaultValues={{
              businessName: formData.businessName,
              gstNumber: formData.gstNumber,
              panNumber: formData.panNumber,
              businessAddress: formData.businessAddress,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode
            }}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 3:
        return (
          <BankDetails
            defaultValues={{
              accountHolderName: formData.accountHolderName,
              bankName: formData.bankName,
              accountNumber: formData.accountNumber,
              confirmAccountNumber: formData.confirmAccountNumber,
              ifscCode: formData.ifscCode,
              upiId: formData.upiId
            }}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 4:
        return (
          <DocumentsUpload
            defaultValues={{
              profilePhoto: formData.profilePhoto,
              gstCertificate: formData.gstCertificate,
              panCard: formData.panCard,
              cancelledCheque: formData.cancelledCheque,
              businessLicense: formData.businessLicense
            }}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
          />
        );
      case 5:
        return (
          <ReviewSubmit
            formData={formData}
            onPrev={handlePrevStep}
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            submitError={error}
            submitSuccess={success}
          />
        );
      default:
        return null;
    }
  };

  // Calculate percentage of track indicator line
  const trackingPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="seller-register-container">
      <div className="seller-wizard-card">
        {/* Wizard Header (Only show if not registered successfully) */}
        {!success && (
          <div className="wizard-header">
            <h2>Seller Registry Portal</h2>
            <p>Onboard your business and start cataloging products on High Mart</p>
          </div>
        )}

        {/* Wizard Step Tracker Progress Bar (Only show if not registered successfully) */}
        {!success && (
          <div className="progress-tracker-bar">
            <div className="tracker-line-fill" style={{ width: `${trackingPercent}%` }}></div>
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div 
                  key={step.id} 
                  className={`progress-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="step-node-circle">
                    {step.id}
                  </div>
                  <span className="step-node-label">{step.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Wizard Active Step component rendering */}
        <div className="wizard-step-body">
          {renderActiveStepComponent()}
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
