const router = require("express").Router();
const paymentController = require("../controllers/paymentController");
const verifyJWT = require("../middleWare/authMiddleWare");

// @route   POST /api/payment/momo/create
// @desc    Create MoMo payment URL
// @access  Private
router.post("/momo/create", verifyJWT, paymentController.createMoMoPayment);

// @route   POST /api/payment/momo/callback
// @desc    MoMo IPN callback (webhook)
// @access  Public (called by MoMo server)
router.post("/momo/callback", paymentController.handleMoMoCallback);

// @route   GET /api/payment/momo/redirect
// @desc    MoMo redirect after payment (user returns)
// @access  Public
router.get("/momo/redirect", paymentController.handleMoMoRedirect);

// ==================== VNPay Routes ====================

// @route   POST /api/payment/vnpay/create
// @desc    Create VNPay payment URL
// @access  Private
router.post("/vnpay/create", verifyJWT, paymentController.createVNPayPayment);

// @route   GET /api/payment/vnpay/callback
// @desc    VNPay return URL (user redirected back after payment)
// @access  Public
router.get("/vnpay/callback", paymentController.handleVNPayCallback);

// @route   GET /api/payment/vnpay/ipn
// @desc    VNPay IPN (Instant Payment Notification)
// @access  Public (called by VNPay server)
router.get("/vnpay/ipn", paymentController.handleVNPayIPN);

module.exports = router;
