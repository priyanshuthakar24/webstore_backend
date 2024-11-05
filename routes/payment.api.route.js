const router = require('express').Router();
const { CreateOrder ,VerifyPayment} = require('../controller/payment.controller')



router.post('/create-order', CreateOrder)
router.post('/verify-payment',VerifyPayment)


module.exports = router