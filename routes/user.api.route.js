const router = require('express').Router();
const { GetAllProduct, ProductDetail } = require('../controller/user.controller')

//? '/api/user/...'

//! all Product Route 
router.get('/shop', GetAllProduct);

//! Product Detail Route 
router.get('/productdetail', ProductDetail);

module.exports = router;