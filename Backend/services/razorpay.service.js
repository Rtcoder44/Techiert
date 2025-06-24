const Razorpay = require('razorpay');

class RazorpayService {
  constructor() {
    this.instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder({ amount, currency = 'INR', receipt }) {
    return this.instance.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt,
      payment_capture: 1,
    });
  }

  async verifySignature({ order_id, payment_id, signature }) {
    const crypto = require('crypto');
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(order_id + '|' + payment_id)
      .digest('hex');
    return generated_signature === signature;
  }
}

module.exports = new RazorpayService(); 