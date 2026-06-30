import React, { useState } from 'react';
import { Package, Calendar, ChevronDown, ChevronUp, MapPin, CreditCard, ShieldCheck, Truck } from 'lucide-react';

const OrderCard = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Delivered': return 'status-delivered';
      case 'Pending': return 'status-pending';
      case 'Processing': return 'status-processing';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'Placed':
      case 'Pending': return 1;
      case 'Processing': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      case 'Cancelled': return -1;
      default: return 1;
    }
  };

  const stepIndex = getStepIndex(order.status);

  return (
    <div className={`order-card-container glass-effect ${isExpanded ? 'expanded' : ''}`}>
      {/* Brief Card Summary */}
      <div className="order-card-summary">
        <div className="order-product-image-box">
          <img src={order.productImage} alt={order.productName} className="order-product-thumbnail" />
        </div>
        
        <div className="order-basic-details">
          <div className="order-header-row">
            <span className="order-id-tag">Order #{order.orderId}</span>
            <span className={`order-status-badge ${getStatusColorClass(order.status)}`}>
              {order.status}
            </span>
          </div>
          <h4 className="order-product-title">{order.productName}</h4>
          <div className="order-date-price-row">
            <div className="order-meta-info">
              <Calendar size={14} />
              <span>{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <span className="order-price-val">₹{order.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="order-action-trigger">
          <button onClick={() => setIsExpanded(!isExpanded)} className="btn-view-details">
            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Order Details Panel */}
      {isExpanded && (
        <div className="order-details-expanded-panel">
          <hr className="details-divider" />
          
          {/* Tracking Timeline Stepper */}
          {order.status !== 'Cancelled' ? (
            <div className="order-stepper-tracker">
              <div className={`step-item ${stepIndex >= 1 ? 'completed' : ''}`}>
                <div className="step-number">1</div>
                <span className="step-label">Ordered</span>
                <span className="step-date">Aug 20, 2026</span>
              </div>
              <div className={`step-line ${stepIndex >= 2 ? 'completed' : ''}`}></div>
              <div className={`step-item ${stepIndex >= 2 ? 'completed' : ''}`}>
                <div className="step-number">2</div>
                <span className="step-label">Processing</span>
                <span className="step-date">Aug 21, 2026</span>
              </div>
              <div className={`step-line ${stepIndex >= 3 ? 'completed' : ''}`}></div>
              <div className={`step-item ${stepIndex >= 3 ? 'completed' : ''}`}>
                <div className="step-number">3</div>
                <span className="step-label">Shipped</span>
                <span className="step-date">Aug 23, 2026</span>
              </div>
              <div className={`step-line ${stepIndex >= 4 ? 'completed' : ''}`}></div>
              <div className={`step-item ${stepIndex >= 4 ? 'completed' : ''}`}>
                <div className="step-number">4</div>
                <span className="step-label">Delivered</span>
                <span className="step-date">Aug 25, 2026</span>
              </div>
            </div>
          ) : (
            <div className="cancelled-stepper-alert">
              <div className="alert-circle-cancel">✕</div>
              <div className="alert-text-cancel">
                <h4>Order Cancelled</h4>
                <p>This order was cancelled on {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}. Refund has been credited back to your original source of payment.</p>
              </div>
            </div>
          )}

          <div className="expanded-details-grid">
            {/* Delivery address */}
            <div className="expanded-details-column">
              <div className="col-header">
                <MapPin size={15} />
                <h5>Shipping Address</h5>
              </div>
              <div className="col-content address-info">
                <h6>{order.shippingAddress?.name || 'Rishi Shopora'}</h6>
                <p>{order.shippingAddress?.street || 'Apt 4B, Harmony Towers, High Street'}</p>
                <p>{order.shippingAddress?.locality ? `${order.shippingAddress.locality}, ` : ''}{order.shippingAddress?.city || 'Bengaluru'}, {order.shippingAddress?.state || 'Karnataka'} - {order.shippingAddress?.pincode || '560038'}</p>
                <p className="phone-meta">Phone: {order.shippingAddress?.phone || '9876543210'}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="expanded-details-column">
              <div className="col-header">
                <CreditCard size={15} />
                <h5>Payment Details</h5>
              </div>
              <div className="col-content payment-info">
                <div className="payment-method-row">
                  <Package size={14} />
                  <span>Method: <strong>{order.paymentMethod || 'High Mart Wallet'}</strong></span>
                </div>
                <div className="payment-status-row">
                  <ShieldCheck size={14} className="text-success" />
                  <span>Status: <strong className="text-success">Paid (Secure Token)</strong></span>
                </div>
                <div className="invoice-row">
                  <Truck size={14} />
                  <span>Carrier: <strong>Delhivery Express</strong></span>
                </div>
              </div>
            </div>

            {/* Billing breakdown */}
            <div className="expanded-details-column">
              <div className="col-header">
                <Package size={15} />
                <h5>Price Summary</h5>
              </div>
              <div className="col-content billing-summary">
                <div className="bill-row">
                  <span>Subtotal:</span>
                  <span>₹{order.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bill-row">
                  <span>Delivery Charges:</span>
                  <span className="text-success">FREE</span>
                </div>
                <div className="bill-row total-bill-row">
                  <span>Grand Total:</span>
                  <span>₹{order.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
