const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

// Add or update item in cart
exports.addToCart = async (req, res) => {
    const userId = req.userId; // Assuming userId is obtained from authentication middleware
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            // Create a new cart if it doesn't exist
            cart = new Cart({ userId, items: [] });
        }

        // Check if item already in cart
        const existingItem = cart.items.find((item) => item.productId.toString() === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId,
                quantity,
                price: product.salePrice,
            });
        }

        // Recalculate total cost
        cart.totalCost = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        await cart.save();
        res.status(200).json(cart);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Get cart items
exports.getCart = async (req, res, next) => {
    const userId = req.userId;
    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId', 'name salePrice mainImage.url ');
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' })
    }
}

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
    const userId = req.userId;
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not fouund' });
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        cart.totalCost = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await cart.save();
        return res.status(200).json({ data: cart, message: 'Product removed Sucessfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' })
    }
}