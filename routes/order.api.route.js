const router = require('express').Router();
const { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook, getAllOrders, UpdateStatus, GetOrderDetail, UpdateLogistics, GetUserOrder } = require('../controller/order.controller')
const { verifyToken, VerifyAdmin } = require('../middleware/verifyToken');

//? '/api/order/...'

//! Razorpay create Order 
router.post('/create-order', verifyToken, createRazorpayOrder)

//! Razorpay Verify order using Webhook
router.post('/webhook/razorpay', razorpayWebhook)

//! Razorpay Verify order by api if Webhook is not Working 
router.post('/verify-payment', verifyToken, verifyRazorpayPayment)

//! Get All the user Order's for only Admin
router.get('/admin/orders', VerifyAdmin, getAllOrders);

//! Get Order Detail
router.get('/admin/orderdetail', VerifyAdmin, GetOrderDetail)

//! Update order status
router.put('/admin/:id/status', VerifyAdmin, UpdateStatus)

//! Update Logistics Detail 
router.post('/admin/logisticsdetail', VerifyAdmin, UpdateLogistics)

//! Get Sepecific User's Order and Detail 
router.get("/userorder", verifyToken, GetUserOrder)

module.exports = router