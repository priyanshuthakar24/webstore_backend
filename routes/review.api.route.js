const router = require('express').Router();
const { AddReview, UserReview } = require('../controller/review.controller');
const { verifyToken } = require('../middleware/verifyToken')

//? '/api/review/...'

//! Add user Review 
router.post('/add', verifyToken, AddReview);

//! User review basedon the user Id  
router.get('/', verifyToken, UserReview);

module.exports = router;