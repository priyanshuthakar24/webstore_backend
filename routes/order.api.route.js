const router = require('express').Router();
const { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook, getAllOrders, UpdateStatus } = require('../controller/order.controller')
const { verifyToken } = require('../middleware/verifyToken');


router.post('/create-order', verifyToken, createRazorpayOrder)
router.post('/verify-payment', verifyToken, verifyRazorpayPayment)
router.post('/webhook/razorpay', razorpayWebhook)

router.get('/admin/orders', getAllOrders);
// Update order status
router.put('/admin/:id/status', UpdateStatus)
module.exports = router