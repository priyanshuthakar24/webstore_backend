const router = require('express').Router();
const { AddReview, UserReview } = require('../controller/review.controller');
const { verifyToken } = require('../middleware/verifyToken')
router.post('/add', verifyToken, AddReview);
router.get('/userreview', verifyToken, UserReview);
module.exports = router;