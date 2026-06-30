import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Home, Briefcase, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';

const MOCK_INITIAL_ADDRESSES = [
  {
    id: 'addr-1',
    name: 'Rishi Shopora',
    phone: '9876543210',
    type: 'Home',
    street: 'Apt 4B, Harmony Towers, High Street',
    locality: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    isDefault: true
  },
  {
    id: 'addr-2',
    name: 'Rishi Shopora (Office)',
    phone: '9876543211',
    type: 'Office',
    street: 'Level 8, Cyber Crest Block A, Tech Park Main Road',
    locality: 'Whitefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    isDefault: false
  }
];

const AddressCard = ({ addToast }) => {
  const [addresses, setAddresses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'Home',
    street: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('highMartAddresses');
    if (saved) {
      setAddresses(JSON.parse(saved));
    } else {
      localStorage.setItem('highMartAddresses', JSON.stringify(MOCK_INITIAL_ADDRESSES));
      setAddresses(MOCK_INITIAL_ADDRESSES);
    }
  }, []);

  const saveToLocalStorage = (list) => {
    localStorage.setItem('highMartAddresses', JSON.stringify(list));
    setAddresses(list);
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      name: '',
      phone: '',
      type: 'Home',
      street: '',
      locality: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: addresses.length === 0 // default if first
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr);
    setFormData({
      name: addr.name,
      phone: addr.phone,
      type: addr.type,
      street: addr.street,
      locality: addr.locality,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const target = addresses.find(a => a.id === id);
    if (target?.isDefault && addresses.length > 1) {
      addToast('Cannot delete default address. Set another default address first.', 'error');
      return;
    }
    const updated = addresses.filter(a => a.id !== id);
    // If we deleted the last default and still have addresses, make the first default
    if (target?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    saveToLocalStorage(updated);
    addToast('Address deleted successfully!', 'info');
  };

  const handleSetDefault = (id) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    saveToLocalStorage(updated);
    addToast('Default address updated.', 'success');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    let updatedAddresses;

    if (editingAddress) {
      // Edit mode
      updatedAddresses = addresses.map(addr => {
        if (addr.id === editingAddress.id) {
          return {
            ...addr,
            ...formData,
            id: addr.id
          };
        }
        // If the edited address was toggled as default, turn other defaults off
        if (formData.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      });
      addToast('Address updated successfully!', 'success');
    } else {
      // Add mode
      const newAddr = {
        ...formData,
        id: 'addr-' + Date.now()
      };

      if (formData.isDefault) {
        updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
        updatedAddresses.push(newAddr);
      } else {
        updatedAddresses = [...addresses, newAddr];
      }
      addToast('New address added!', 'success');
    }

    saveToLocalStorage(updatedAddresses);
    setIsModalOpen(false);
  };

  return (
    <div className="address-management-section">
      <div className="section-title-action">
        <div className="widget-header">
          <MapPin size={18} className="widget-icon" />
          <h3>Manage Delivery Addresses</h3>
        </div>
        <button onClick={handleOpenAdd} className="btn-add-address">
          <Plus size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      <div className="addresses-grid">
        {addresses.map(addr => (
          <div key={addr.id} className={`address-card glass-effect ${addr.isDefault ? 'default' : ''}`}>
            {addr.isDefault && (
              <div className="default-badge">
                <ShieldCheck size={14} />
                <span>Default Address</span>
              </div>
            )}
            <div className="address-type-icon">
              {addr.type === 'Home' ? <Home size={16} /> : addr.type === 'Office' ? <Briefcase size={16} /> : <MapPin size={16} />}
              <span className="address-tag-type">{addr.type}</span>
            </div>
            
            <div className="address-details-body">
              <h4 className="addr-recipient-name">{addr.name}</h4>
              <p className="addr-street-line">{addr.street}</p>
              <p className="addr-locality-line">{addr.locality && `${addr.locality}, `}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
              <p className="addr-phone-line">Mobile: <span>{addr.phone}</span></p>
            </div>

            <div className="address-card-actions">
              {!addr.isDefault && (
                <button 
                  onClick={() => handleSetDefault(addr.id)} 
                  className="action-btn-text text-primary"
                  title="Make Default"
                >
                  <CheckCircle size={14} />
                  <span>Set Default</span>
                </button>
              )}
              <div className="crud-action-buttons">
                <button onClick={() => handleOpenEdit(addr)} className="action-btn-icon" aria-label="Edit address">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(addr.id)} className="action-btn-icon text-error" aria-label="Delete address">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="empty-addresses-message">
            <MapPin size={32} className="empty-icon" />
            <p>No shipping addresses saved yet. Add one to complete orders faster!</p>
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      {isModalOpen && (
        <div className="address-modal-overlay">
          <div className="address-modal-box glass-effect animate-fade-in">
            <div className="modal-header">
              <h3>{editingAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn" aria-label="Close modal">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="address-form-content">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="addr-name">Recipient Full Name *</label>
                  <input
                    type="text"
                    id="addr-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rishi Shopora"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="addr-phone">Recipient Mobile Number *</label>
                  <input
                    type="tel"
                    id="addr-phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-2">
                  <label htmlFor="addr-street">Street Address / Flat No / Building *</label>
                  <input
                    type="text"
                    id="addr-street"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="e.g. Apt 4B, Harmony Towers, High Street"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="addr-type">Address Type</label>
                  <select
                    id="addr-type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="Home">Home (Delivery all day)</option>
                    <option value="Office">Office (Delivery 9 AM - 6 PM)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="addr-locality">Locality / Landmark</label>
                  <input
                    type="text"
                    id="addr-locality"
                    name="locality"
                    value={formData.locality}
                    onChange={handleChange}
                    placeholder="e.g. Indiranagar"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="addr-city">City *</label>
                  <input
                    type="text"
                    id="addr-city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="addr-state">State *</label>
                  <input
                    type="text"
                    id="addr-state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="addr-pincode">Pin Code *</label>
                  <input
                    type="text"
                    id="addr-pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 560038"
                    required
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="addr-default"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  disabled={addresses.length === 0 || (editingAddress && editingAddress.isDefault)}
                />
                <label htmlFor="addr-default">Set as default delivery address</label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-save">{editingAddress ? 'Update Address' : 'Save Address'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressCard;
