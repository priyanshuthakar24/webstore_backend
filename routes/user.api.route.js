const router = require('express').Router();
const { verifyToken } = require('../middleware/verifyToken')
const { GetAllProduct, ProductDetail } = require('../controller/user.controller')

router.get('/shop', GetAllProduct);
router.get('/productdetail', ProductDetail);
module.exports = router;