const router = require('express').Router()
const { AddtoWishllist, RemoveWishlist, Getwishlist } = require('../controller/wishlist.controller');
const { verifyToken } = require('../middleware/verifyToken')

router.post('/add', verifyToken, AddtoWishllist);
router.post('/remove', verifyToken, RemoveWishlist);
router.get('/all', verifyToken, Getwishlist);

module.exports = router;