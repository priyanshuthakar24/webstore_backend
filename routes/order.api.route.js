const router = require('express').Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controller/order.controller')
const { verifyToken } = require('../middleware/verifyToken');


router.post('/create-order', verifyToken, createRazorpayOrder)
router.post('/verify-payment', verifyToken, verifyRazorpayPayment)


module.exports = router