const router = require('express').Router();
const { addToCart, getCart, removeFromCart } = require('../controller/cart.controller');
const { verifyToken } = require('../middleware/verifyToken');


router.post('/add', verifyToken, addToCart); // Add to cart
router.get('/', verifyToken, getCart); //Get Cart contnts
router.delete('/remove/:productId', verifyToken, removeFromCart); //Remove Item

module.exports = router;