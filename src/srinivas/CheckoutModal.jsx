import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { paymentService } from './paymentService';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Shield, CheckCircle, HelpCircle, Info, CreditCard, DollarSign } from 'lucide-react';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, cartItems, cartTotal }) => {
  const { clearCart, addToast } = useContext(AppContext);
  const currentUser = authService.getCurrentUser() || { name: 'Jane Doe', email: 'jane@example.com' };
  const navigate = useNavigate();

  // Form states
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(0); // in percent

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('stripe'); // 'stripe' or 'razorpay'
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [focusedInput, setFocusedInput] = useState(''); // tracking card flip

  // Status states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0); // 0: intent, 1: auth, 2: order, 3: success
  const [txId, setTxId] = useState('');

  // Auto detect card type
  const [cardBrand, setCardBrand] = useState('unknown');

  useEffect(() => {
    if (cardNumber.startsWith('4')) {
      setCardBrand('visa');
    } else if (/^5[1-5]/.test(cardNumber)) {
      setCardBrand('mastercard');
    } else if (/^3[47]/.test(cardNumber)) {
      setCardBrand('amex');
    } else {
      setCardBrand('unknown');
    }
  }, [cardNumber]);

  if (!isOpen) return null;

  // Cost calculation
  const expressShippingFee = cartTotal > 100 ? 0 : 5.99;
  const discountAmount = cartTotal * (discountApplied / 100);
  const estTax = (cartTotal - discountAmount) * 0.08; // 8% sales tax
  const codFee = paymentMethod === 'cod' ? 9.00 : 0;
  const finalTotal = cartTotal - discountAmount + estTax + expressShippingFee + codFee;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase().trim() === 'HMTECH70') {
      setDiscountApplied(20); // 20% off
      addToast('Promo Code HMTECH70 Applied: 20% Discount Activated!', 'success');
    } else {
      addToast('Invalid or expired promotional code.', 'error');
    }
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += value[i];
    }
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    if (value.length > 0) {
      formatted = value.substring(0, 2);
      if (value.length > 2) {
        formatted += '/' + value.substring(2, 4);
      }
    }
    setExpiry(formatted);
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvc(value);
  };

  const handleClose = () => {
    onClose();
    if (processingStep === 3) {
      navigate('/profile', { state: { activeTab: 'orders' } });
    }
  };

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      addToast('Please specify your shipping destination address.', 'error');
      return;
    }
    if (!phone.trim()) {
      addToast('Please provide a contact phone number.', 'error');
      return;
    }

    if (paymentMethod === 'stripe') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        addToast('Please enter a valid 16-digit card number.', 'error');
        return;
      }
      if (expiry.length < 5) {
        addToast('Please provide your card expiry date (MM/YY).', 'error');
        return;
      }
      if (cvc.length < 3) {
        addToast('Please provide a valid card CVC code.', 'error');
        return;
      }
    }

    if (paymentMethod === 'cod') {
      setIsProcessing(true);
      setProcessingStep(0); // Securing endpoint
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProcessingStep(1); // Gateway handshakes
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingStep(2); // Order register
        
        const transactionId = `cod_mock_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
        
        await paymentService.createPaidOrder({
          shippingAddress,
          paymentMethod: 'Cash on Delivery (COD)',
          paymentStatus: 'Pending',
          transactionId,
          totalAmount: parseFloat(finalTotal.toFixed(2)),
          customerName: currentUser.name,
          customerEmail: currentUser.email,
          customerPhone: phone,
          items: cartItems
        });

        setTxId(transactionId);
        setProcessingStep(3); // Success
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        clearCart();
        addToast('COD Order Registered Successfully!', 'success');
      } catch (err) {
        addToast(`Order failed: ${err.message}`, 'error');
        setIsProcessing(false);
      }
      return;
    }

    // Begin visual authorization steps
    setIsProcessing(true);
    setProcessingStep(0); // Creating Payment Intent

    try {
      if (paymentMethod === 'stripe') {
        // Step 1: Request Payment Intent
        await paymentService.createPaymentIntent(finalTotal);
        
        // Step 2: Simulating bank authorization handshakes
        setProcessingStep(1);
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Step 3: Register Paid Order in DB
        setProcessingStep(2);
        const transactionId = `pi_live_tx_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
        const orderResult = await paymentService.createPaidOrder({
          shippingAddress,
          paymentMethod: 'Stripe Card',
          transactionId,
          totalAmount: parseFloat(finalTotal.toFixed(2)),
          customerName: currentUser.name,
          customerEmail: currentUser.email,
          customerPhone: phone,
          items: cartItems
        });

        setTxId(transactionId);
        setProcessingStep(3); // Success
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        clearCart();
        addToast('Payment Authorized & Order Registered!', 'success');
      } else {
        // Razorpay express checkout flow
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProcessingStep(1); // Integrating Gateway overlay
        await new Promise(resolve => setTimeout(resolve, 1200));

        setProcessingStep(2); // Generating signatures
        const rzpId = `rzp_pay_${Math.random().toString(36).substring(2, 10)}`;
        const verification = await paymentService.verifyRazorpay({
          razorpay_payment_id: rzpId,
          razorpay_signature: `rzp_sig_${Math.random().toString(36).substring(2, 12)}`
        });

        const orderResult = await paymentService.createPaidOrder({
          shippingAddress,
          paymentMethod: 'Razorpay UPI',
          transactionId: verification.transactionId,
          totalAmount: parseFloat(finalTotal.toFixed(2)),
          customerName: currentUser.name,
          customerEmail: currentUser.email,
          customerPhone: phone,
          items: cartItems
        });

        setTxId(verification.transactionId);
        setProcessingStep(3); // Success
        await new Promise(resolve => setTimeout(resolve, 1500));

        clearCart();
        addToast('Razorpay Express Payment Complete!', 'success');
      }
    } catch (err) {
      addToast(`Payment failed: ${err.message}`, 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-backdrop animate-fade-in">
      <div className="checkout-dialog glass-effect">
        
        {/* Header */}
        <div className="checkout-header">
          <div className="header-icon-label">
            <Lock size={18} className="lock-icon" />
            <h2>Secure Checkout Gateway</h2>
          </div>
          {!isProcessing && (
            <button className="close-btn" onClick={handleClose} aria-label="Close Checkout">
              <X size={20} />
            </button>
          )}
        </div>

        {isProcessing ? (
          /* TRANSACTION PROCESSING STATES PANEL */
          <div className="payment-processing-panel">
            {processingStep < 3 ? (
              <div className="payment-loader-wrapper">
                <div className="glowing-spinner"></div>
                <h3>Authorizing Payment</h3>
                <div className="processing-progress-steps">
                  <div className={`step-item ${processingStep >= 0 ? 'active' : ''}`}>
                    <span className="dot"></span>
                    <p>Securing Endpoint Connection</p>
                  </div>
                  <div className={`step-item ${processingStep >= 1 ? 'active' : ''}`}>
                    <span className="dot"></span>
                    <p>Contacting Issuing Gateway Partner</p>
                  </div>
                  <div className={`step-item ${processingStep >= 2 ? 'active' : ''}`}>
                    <span className="dot"></span>
                    <p>Registering Order & Clear Cart</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="payment-success-card animate-fade-in">
                <div className="checkmark-icon-wrapper">
                  <CheckCircle size={58} className="success-icon" />
                </div>
                <h3>Transaction Success!</h3>
                <p className="sub-text">Thank you for your purchase. We have notified shipping carriers.</p>
                <div className="receipt-box-info glass-effect">
                  <div className="receipt-row">
                    <span>Receipt ID:</span>
                    <strong>HM-TXN-{txId.substring(8, 16).toUpperCase()}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Paid Amount:</span>
                    <strong>₹{finalTotal.toFixed(2)}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Method:</span>
                    <strong>{paymentMethod === 'stripe' ? 'Stripe Secure Card' : paymentMethod === 'razorpay' ? 'Razorpay Express' : 'Cash on Delivery (COD)'}</strong>
                  </div>
                </div>
                <button className="checkout-success-continue-btn" onClick={handleClose}>
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        ) : (
          /* CHECKOUT DIALOG FORM PANEL */
          <div className="checkout-main-grid">
            
            {/* Left: Fields Form */}
            <form onSubmit={handleSubmitCheckout} className="checkout-form-col">
              
              {/* Shipping Information Group */}
              <div className="form-section">
                <h3>1. Delivery Destination</h3>
                <div className="form-field-group">
                  <div className="field-input-box">
                    <label>Shipping Street Address</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. 123 Main St, Apartment 4B"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                    />
                  </div>
                  <div className="field-input-box">
                    <label>Contact Phone Number</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. 987-654-3210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="form-section">
                <h3>2. Gateway Selection</h3>
                <div className="gateway-selector-tabs">
                  <button 
                    type="button"
                    className={`gateway-tab ${paymentMethod === 'stripe' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('stripe')}
                  >
                    <CreditCard size={16} />
                    <span>Stripe Card</span>
                  </button>
                  <button 
                    type="button"
                    className={`gateway-tab ${paymentMethod === 'razorpay' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('razorpay')}
                  >
                    <Shield size={16} />
                    <span>Razorpay UPI</span>
                  </button>
                  <button 
                    type="button"
                    className={`gateway-tab ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <DollarSign size={16} />
                    <span>Cash on Delivery</span>
                  </button>
                </div>

                {paymentMethod === 'stripe' ? (
                  /* STRIPE SECURE CARD INPUTS */
                  <div className="stripe-credit-card-inputs-panel animate-fade-in">
                    
                    {/* Visual Credit Card */}
                    <div className={`virtual-credit-card-preview ${focusedInput === 'cvc' ? 'flipped' : ''}`}>
                      <div className="card-face card-front">
                        <div className="card-top-row">
                          <span className="card-chip"></span>
                          <span className={`card-logo-brand ${cardBrand}`}></span>
                        </div>
                        <div className="card-digits-row">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="card-bottom-row">
                          <div className="card-lbl-holder">
                            <span>CARD HOLDER</span>
                            <strong>{cardName.toUpperCase() || 'JANE DOE'}</strong>
                          </div>
                          <div className="card-lbl-holder">
                            <span>EXPIRES</span>
                            <strong>{expiry || 'MM/YY'}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="card-face card-back">
                        <div className="card-black-stripe"></div>
                        <div className="card-signature-box">
                          <span className="cvc-lbl-back">CVC</span>
                          <div className="cvc-number-badge">{cvc || '•••'}</div>
                        </div>
                        <p className="card-disclaimer-back">This transaction is processed over a secure end-to-end sandbox layer.</p>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="card-inputs-grid">
                      <div className="field-input-box wide-span">
                        <label>Cardholder Name</label>
                        <input 
                          type="text" 
                          required={paymentMethod === 'stripe'}
                          placeholder="Jane Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          onFocus={() => setFocusedInput('name')}
                        />
                      </div>
                      <div className="field-input-box wide-span">
                        <label>Card Number</label>
                        <input 
                          type="text" 
                          required={paymentMethod === 'stripe'}
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          onFocus={() => setFocusedInput('number')}
                        />
                      </div>
                      <div className="field-input-box">
                        <label>Expiration Date</label>
                        <input 
                          type="text" 
                          required={paymentMethod === 'stripe'}
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                          onFocus={() => setFocusedInput('expiry')}
                        />
                      </div>
                      <div className="field-input-box">
                        <label>CVC / CVV</label>
                        <input 
                          type="password" 
                          required={paymentMethod === 'stripe'}
                          placeholder="123"
                          value={cvc}
                          onChange={handleCvcChange}
                          onFocus={() => setFocusedInput('cvc')}
                          onBlur={() => setFocusedInput('')}
                        />
                      </div>
                    </div>
                  </div>
                ) : paymentMethod === 'razorpay' ? (
                  /* RAZORPAY UPI DETAILS */
                  <div className="razorpay-express-inputs-panel animate-fade-in">
                    <div className="razorpay-visual-bulletin glass-effect">
                      <Shield size={28} className="razorpay-shield-icon" />
                      <div className="bulletin-text">
                        <h4>Razorpay UPI & Smart checkout</h4>
                        <p>Complete your payment instantly using Google Pay, PhonePe, Paytm, or BHIM. Zero card details required.</p>
                      </div>
                    </div>
                    <div className="field-input-box">
                      <label>UPI VPA ID (Virtual Payment Address)</label>
                      <input 
                        type="text" 
                        required={paymentMethod === 'razorpay'} 
                        placeholder="e.g. janedoe@okaxis" 
                      />
                    </div>
                  </div>
                ) : (
                  /* CASH ON DELIVERY DETAILS */
                  <div className="cod-inputs-panel animate-fade-in">
                    <div className="cod-visual-bulletin glass-effect">
                      <DollarSign size={28} className="cod-dollar-icon" />
                      <div className="bulletin-text">
                        <h4>Cash on Delivery Service (COD)</h4>
                        <p>An extra surcharge of <strong>₹9.00</strong> COD handling fee is added to your total. Pay using Cash, UPI, or card when the shipping carrier hands over your package.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Secure Actions Button */}
              <button type="submit" className="secure-checkout-submit-btn">
                <Lock size={16} />
                <span>Confirm Payment of ₹{finalTotal.toFixed(2)}</span>
              </button>
            </form>

            {/* Right: Cart Summary Col */}
            <div className="checkout-summary-col glass-effect">
              <h3>Cart Summary</h3>
              <div className="summary-items-scroll">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item-row">
                    <div className="sum-item-thumbnail">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="sum-item-desc">
                      <h4>{item.name}</h4>
                      <p>₹{(item.price * (1 - item.discount / 100)).toFixed(2)} x {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="summary-divider" />

              {/* Coupon Row */}
              <div className="checkout-coupon-apply-row">
                <input 
                  type="text" 
                  placeholder="Promo Code (HMTECH70)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="button" onClick={handleApplyCoupon}>Apply</button>
              </div>

              {/* Pricing breakdown */}
              <ul className="cost-breakdown-checklist">
                <li>
                  <span className="lbl">Items Subtotal</span>
                  <span className="val">₹{cartTotal.toFixed(2)}</span>
                </li>
                {discountApplied > 0 && (
                  <li className="discount-applied">
                    <span className="lbl">Promo Code ({discountApplied}%)</span>
                    <span className="val">-₹{discountAmount.toFixed(2)}</span>
                  </li>
                )}
                <li>
                  <span className="lbl">Express Priority Shipping</span>
                  <span className="val">{expressShippingFee === 0 ? 'FREE' : `₹${expressShippingFee.toFixed(2)}`}</span>
                </li>
                <li>
                  <span className="lbl">Estimated GST/Sales Tax (8%)</span>
                  <span className="val">₹{estTax.toFixed(2)}</span>
                </li>
                {paymentMethod === 'cod' && (
                  <li className="cod-surcharge-row">
                    <span className="lbl">COD Service Fee Surcharge</span>
                    <span className="val">₹9.00</span>
                  </li>
                )}
                <hr className="sub-divider" />
                <li className="grand-total-row">
                  <span className="lbl">Grand Total</span>
                  <span className="val">₹{finalTotal.toFixed(2)}</span>
                </li>
              </ul>

              {/* Security Badges */}
              <div className="sec-trust-badges">
                <div className="trust-badge">
                  <Shield size={14} className="badge-ico" />
                  <span>256-bit AES Secured SSL</span>
                </div>
                <div className="trust-badge">
                  <Lock size={14} className="badge-ico" />
                  <span>PCI-DSS Compliant Gateway</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
