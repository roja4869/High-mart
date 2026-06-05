import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('highMartToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const paymentService = {
  // Create Stripe payment intent
  async createPaymentIntent(amount) {
    try {
      const response = await api.post('/payment/create-payment-intent', { amount, currency: 'usd' });
      return response.data;
    } catch (err) {
      console.error('Payment intent creation failed:', err.message);
      throw err;
    }
  },

  // Verify Razorpay Payment Signature
  async verifyRazorpay(paymentData) {
    try {
      const response = await api.post('/payment/verify-razorpay', paymentData);
      return response.data;
    } catch (err) {
      console.error('Razorpay verification failed:', err.message);
      throw err;
    }
  },

  // Place a completed paid order
  async createPaidOrder(orderData) {
    try {
      const response = await api.post('/orders', {
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentStatus || 'Paid',
        transactionId: orderData.transactionId,
        totalAmount: orderData.totalAmount,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        items: orderData.items
      });
      return response.data;
    } catch (err) {
      console.error('Order creation failed:', err.message);
      throw err;
    }
  }
};
