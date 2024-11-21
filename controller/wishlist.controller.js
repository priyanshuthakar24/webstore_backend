const User = require('../models/user.models');
exports.AddtoWishllist = async (req, res, next) => {
    const userId = req.userId;
    const { productId } = req.body
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        res.status(200).json({ message: 'Product added to wishlist', wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, error })
    }
}

exports.RemoveWishlist = async (req, res, next) => {
    const userId = req.userId;
    const { productId } = req.body;
    try {
        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not Found' })
        user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
        await user.save();
        res.status(200).json({ message: 'Product removed to wishlist', wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Error removing product from wishlist', error });
    }
}

exports.Getwishlist = async (req, res, nex) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId).populate('wishlist', 'name mainImage salePrice');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wishlist', error });
    }
}