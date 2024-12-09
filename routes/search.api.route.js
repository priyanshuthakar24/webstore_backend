const router = require('express').Router()
const { SearchOrder, SearchProduct } = require('../controller/search.controller')
const { VerifyAdmin } = require('../middleware/verifyToken')

//? '/api/search/...'

//! Search order for admin 
router.get('/order', VerifyAdmin, SearchOrder);

//! Search product for user 
router.get('/product', SearchProduct);


module.exports = router