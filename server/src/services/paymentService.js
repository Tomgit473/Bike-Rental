import crypto from "crypto";
import Razorpay from "razorpay";
import Stripe from "stripe";

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

export const createStripeIntent = async ({ amount, currency = "INR", metadata = {} }) => {
  const stripe = getStripe();

  if (!stripe) {
    return {
      id: `pi_mock_${Date.now()}`,
      clientSecret: `pi_mock_secret_${Date.now()}`,
      provider: "stripe",
      mock: true
    };
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    metadata,
    automatic_payment_methods: { enabled: true }
  });

  return {
    id: intent.id,
    clientSecret: intent.client_secret,
    provider: "stripe"
  };
};

export const createRazorpayOrder = async ({ amount, currency = "INR", receipt, notes = {} }) => {
  const razorpay = getRazorpay();

  if (!razorpay) {
    return {
      id: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      receipt,
      provider: "razorpay",
      mock: true
    };
  }

  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
    notes
  });
};

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!process.env.RAZORPAY_KEY_SECRET) return true;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return expected === signature;
};
