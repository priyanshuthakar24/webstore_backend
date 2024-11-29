const jwt = require('jsonwebtoken');

//! Verify the user token is valid or not 
exports.verifyToken = async (req, res, next) => {
    const token = await req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: 'Please Login !' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(401).json({ success: false, message: 'Unauthorized -no token provided' });
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

//! Verify the User Token is Valid or Not ALso Check For the Admin Role 
exports.VerifyAdmin = async (req, res, next) => {
    const token = await req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized only admin can access this!' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role) {
            req.userId = decoded.userId
            next()
        } else {
            return res.status(401).json({ success: false, message: 'Unauthorized -no token provided' })
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server Error' })
    }
}