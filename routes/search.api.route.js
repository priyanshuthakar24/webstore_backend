const router = require('express').Router()
const { SearchOrder, SearchProduct } = require('../controller/search.controller')

router.get('/order', SearchOrder);
router.get('/product', SearchProduct);
module.exports = router