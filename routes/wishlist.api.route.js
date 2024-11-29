const router = require('express').Router()
const { AddtoWishllist, RemoveWishlist, Getwishlist } = require('../controller/wishlist.controller');
const { verifyToken } = require('../middleware/verifyToken')


//? '/api/wishlist/...'

//! Product add to wishlist 
router.post('/add', verifyToken, AddtoWishllist);

//! Remove Product wishlist 
router.post('/remove', verifyToken, RemoveWishlist);

//! Get wishlist of the specific user
router.get('/all', verifyToken, Getwishlist);

module.exports = router;