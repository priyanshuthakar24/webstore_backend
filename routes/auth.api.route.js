const router = require('express').Router();
const { login, signup, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, validationtoken } = require('../controller/auth.controller')
const { verifyToken } = require('../middleware/verifyToken');
const { body } = require('express-validator');

//? '/api/auth/...'

//! Check the user token is Vaid or not also update the user data when user Refresh the Page 
router.get('/check-auth', verifyToken, checkAuth);

//! User Signup
router.post('/signup', [
  body('email').isEmail().withMessage('Is not a Valid Email'),
  body('password').isLength({ min: 6 }).withMessage('Password is must be at least 6 characters'),
  body('name').isLength({ min: 3 }).withMessage('Minimum 3 character are required and no Numeric character ')
], signup);

//! User Login
router.post('/login', [
  body('email').isEmail().withMessage('Is not a valid Email'),
  body('password').isLength({ min: 6 }).withMessage('Password is must be at least 6 characters')
], login);

//! User Logout
router.post('/logout', logout);

//! User Verify-Email
router.post('/verify-email', verifyEmail);

//! User Forget-Password
router.post('/forgot-password', [body('email').isEmail().withMessage('Is not a valid email')], forgotPassword);

//! User Reset-Password
router.post('/reset-password/:token', [body('password').isLength({ min: 6 }).withMessage('Password is must be at least 6 characters')], resetPassword);


module.exports = router;
