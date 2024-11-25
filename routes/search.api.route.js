const router = require('express').Router()
const { SearchOrder, SearchProduct } = require('../controller/search.controller')
const { VerifyAdmin } = require('../middleware/verifyToken')
router.get('/order', VerifyAdmin, SearchOrder);
router.get('/product', SearchProduct);
module.exports = router