const router = require('express').Router();
const { createRazorpayOrder, verifyRazorpayPayment, razorpayWebhook, getAllOrders, UpdateStatus, GetOrderDetail, UpdateLogistics, GetUserOrder } = require('../controller/order.controller')
const { verifyToken, VerifyAdmin } = require('../middleware/verifyToken');


router.post('/create-order', verifyToken, createRazorpayOrder)
router.post('/verify-payment', verifyToken, verifyRazorpayPayment)
router.post('/webhook/razorpay', razorpayWebhook)

router.get('/admin/orders', VerifyAdmin, getAllOrders);
router.get('/admin/orderdetail', VerifyAdmin, GetOrderDetail)

// Update order status
router.put('/admin/:id/status', VerifyAdmin, UpdateStatus)
router.post('/admin/logisticsdetail', VerifyAdmin, UpdateLogistics)


// user orderdata 
router.get("/userorder", verifyToken, GetUserOrder)
module.exports = router