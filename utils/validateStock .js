const Product = require('../models/product.model')
exports.validateStock = async (orderItems) => {
    for (const item of orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
            const stockItem = product.stock.find(stock => stock.size === item.size);
            if (!stockItem || stockItem.quantity < item.quantity) {
                return false; // Insufficient stock for this item
            }
        } else {
            return false; // Product not found
        }
    }
    return true; // All items have sufficient stock
};
