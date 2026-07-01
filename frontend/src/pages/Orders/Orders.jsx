import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../App';
import { orderService } from '../../services/orderService';
import OrderCard from '../../components/OrderCard/OrderCard';
import { ShoppingBag, Loader2, ChevronRight, Home } from 'lucide-react';
import './Orders.css';

const MOCK_ORDER_SEED = [
  {
    orderId: '8215',
    date: '2026-05-24T12:00:00.000Z',
    productName: 'Wireless Over-Ear ANC Headphones',
    price: 129.99,
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    status: 'Delivered',
    paymentMethod: 'High Mart Wallet',
    shippingAddress: {
      name: 'Rishi Shopora',
      phone: '9876543210',
      street: 'Apt 4B, Harmony Towers, High Street',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    }
  },
  {
    orderId: '7034',
    date: '2026-05-30T15:30:00.000Z',
    productName: 'Minimalist Quartz Leather Watch',
    price: 79.99,
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    status: 'Processing',
    paymentMethod: 'Credit Card (Visa)',
    shippingAddress: {
      name: 'Rishi Shopora',
      phone: '9876543210',
      street: 'Apt 4B, Harmony Towers, High Street',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    }
  }
];

const Orders = () => {
  const { addToast } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchOrders = async () => {
      try {
        const fetchedOrders = await orderService.getOrders();
        if (Array.isArray(fetchedOrders)) {
          setOrders(fetchedOrders);
        } else if (fetchedOrders && Array.isArray(fetchedOrders.orders)) {
          setOrders(fetchedOrders.orders);
        } else if (fetchedOrders && fetchedOrders.success && Array.isArray(fetchedOrders.data)) {
          setOrders(fetchedOrders.data);
        } else {
          loadFallback();
        }
      } catch (err) {
        console.warn("Failed to fetch orders from API. Using local storage / fallback data.", err.message);
        loadFallback();
      } finally {
        setIsLoading(false);
      }
    };

    const loadFallback = () => {
      const savedOrders = localStorage.getItem('highMartOrders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        localStorage.setItem('highMartOrders', JSON.stringify(MOCK_ORDER_SEED));
        setOrders(MOCK_ORDER_SEED);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="orders-page-loading">
        <Loader2 className="spinning-loader" size={40} />
        <p>Retrieving your order history...</p>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper section-padding">
      <div className="orders-container">
        {/* Breadcrumb Navigation */}
        <div className="orders-breadcrumb">
          <Link to="/"><Home size={14} style={{ marginRight: '4px' }} /> Home</Link>
          <ChevronRight size={14} className="separator-icon" />
          <Link to="/profile">Profile</Link>
          <ChevronRight size={14} className="separator-icon" />
          <span className="current">My Orders</span>
        </div>

        <div className="orders-header-row">
          <div className="header-title-sec">
            <ShoppingBag size={28} className="header-icon" />
            <h1>Order History</h1>
          </div>
          <p className="orders-count-text">
            Track and view details of your <strong>{orders.length}</strong> placed {orders.length === 1 ? 'order' : 'orders'}.
          </p>
        </div>

        <div className="orders-list-detailed-box">
          {orders.map(order => (
            <OrderCard key={order.orderId || order.id} order={order} />
          ))}
          {orders.length === 0 && (
            <div className="empty-orders-state glass-effect">
              <ShoppingBag size={64} className="empty-icon" />
              <h3>No Orders Found</h3>
              <p>You haven't placed any orders yet. Visit our shop and explore the premium collections.</p>
              <Link to="/products" className="btn-shop-now">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
