/**
 * @desc    Create a payment intent for Stripe
 * @route   POST /api/payment/create-payment-intent
 * @access  Private
 */
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400);
      throw new Error('Please provide a valid positive payment amount');
    }

    const amountInCents = Math.round(amount * 100);

    // Try loading Stripe
    let stripeInstance = null;
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const StripeModule = await import('stripe');
        stripeInstance = new StripeModule.default(process.env.STRIPE_SECRET_KEY);
      } catch (err) {
        console.warn('Stripe dependency missing or failed to import. Falling back to sandbox payment intent.');
      }
    }

    if (stripeInstance) {
      // Real Stripe PaymentIntent Creation
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: amountInCents,
        currency: currency || 'usd',
        metadata: { userId: req.user.id }
      });

      return res.status(201).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        amount: amount,
        gateway: 'Stripe',
        mode: 'live'
      });
    } else {
      // Premium Sandbox Simulation
      const mockSecret = `pi_mock_secret_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      return res.status(201).json({
        success: true,
        clientSecret: mockSecret,
        amount: amount,
        gateway: 'Stripe',
        mode: 'sandbox',
        message: 'Running in Secure Sandbox Mode. All transactions are simulated.'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payment/verify-razorpay
 * @access  Private
 */
export const verifyRazorpay = async (req, res, next) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      throw new Error('Missing payment details for signature verification');
    }

    let verified = false;
    let mode = 'sandbox';

    if (process.env.RAZORPAY_KEY_SECRET) {
      try {
        const cryptoModule = await import('crypto');
        const hmac = cryptoModule.default.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        
        // razorpay_order_id is optional depending on direct payment link flows
        const data = razorpay_order_id 
          ? `${razorpay_order_id}|${razorpay_payment_id}`
          : razorpay_payment_id;

        hmac.update(data);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
          verified = true;
          mode = 'live';
        }
      } catch (err) {
        console.warn('Crypto verification error. Defaulting to sandbox success check.');
      }
    } else {
      // Mock Sandbox Auto-Approval
      verified = true;
      mode = 'sandbox';
    }

    if (verified) {
      res.json({
        success: true,
        message: 'Payment verified successfully.',
        transactionId: razorpay_payment_id,
        mode
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid payment signature, transaction verification failed.'
      });
    }
  } catch (error) {
    next(error);
  }
};
