const router = require('express').Router();
const { addToCart, getCart, removeFromCart } = require('../controller/cart.controller');
const { verifyToken } = require('../middleware/verifyToken');

//? '/api/cart/...'

//! Add the Product to the Cart 
router.post('/add', verifyToken, addToCart);

//! Remove the Product From Cart
router.delete('/remove', verifyToken, removeFromCart);

//! Get the Cart Detail for Sepcific User 
router.get('/', verifyToken, getCart);

module.exports = router;