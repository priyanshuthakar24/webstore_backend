const User = require('../models/user.models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateVerificationToken } = require('../utils/generateVerificationToken');
const { generateTokenAndSetCookie } = require('../utils/generateTokenAndSetCookie');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require('../mail/email');
const { validationResult } = require('express-validator');

//! signup methood 
exports.signup = async (req, res, next) => {
    const { email, name, password } = req.body;
    console.log(email, name, password)
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg.toString() });
        }
        // if (!email || !password || !name) {
        //     throw new Error("All fields are required!");
        // }
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: 'User Already exists!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,//24 hours
        });
        await user.save();
        //jwt
        generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(user.email, verificationToken);
        res.status(201).json({
            success: true,
            message: "User created Sucessfully",
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

//! Email-Verification
exports.verifyEmail = async (req, res, next) => {
    const { code } = req.body;
    try {
        if (!code) throw new Error("Code is required")

        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" })
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        await sendWelcomeEmail(user.email, user.name);

        res.status(200).json({
            success: true,
            message: 'Email verified  successfully',
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        // console.log("error in verifyEmail ", error);
        console.log('method call');
        res.status(500).json({ success: false, message: error.message });
    }
}


exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg.toString() })
        }
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ success: false, message: 'User Not Found' })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });
        }

        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            user: {
                ...user._doc,
                password: undefined
            }
        })

    } catch (error) {
        console.log("Error in Login ", error);
        res.status(400).json({ success: false, message: error.message });
    }
}

//! Logout method 
exports.logout = async (req, res, next) => {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'Strict',  // Make sure this matches how you set the cookie
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' })
}

//! forgot-password method 
exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body
    try {
        const errors = validationResult(req);
        console.log(errors.array())
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg.toString() })
        }
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not Found' });
        }
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;//1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`);
        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

//! Reset-Password method 
exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg });
        }
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or Expired reset Token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();
        await sendResetSuccessEmail(user.email);

        res.status(200).json({ success: true, message: "Password reset Successfully" });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

//! check for authentication if user is valid or not with jwt token  
exports.checkAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select('-password');

        if (!user) {
            return res.status(400).json({ success: false, message: 'User Not Found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}