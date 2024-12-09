const Product = require('../models/product.model');
const Order = require('../models/orders.model');
exports.AddReview = async (req, res, nexxt) => {
    const { productId } = req.query;
    const { rating, comment, name } = req.body;
    const userId = req.userId;

    // Check if the user has purchased the product
    const hasPurchased = await Order.findOne({
        user: userId,
        "orderItems.product": productId, // Assuming `items` contains an array of products in the order
    });
    if (!hasPurchased) {
        return res.status(403).json({ message: "You can only review products you have purchased." });
    }
    const product = await Product.findById(productId);
    if (product) {
        // Check if user has already reviewed this product
        const existingReviewIndex = product.reviews.findIndex(
            (r) => r.user.toString() === userId.toString()
        );
        if (existingReviewIndex !== -1) {
            // Update the existing review
            product.reviews[existingReviewIndex].rating = Number(rating);
            product.reviews[existingReviewIndex].comment = comment;
            product.reviews[existingReviewIndex].createdAt = Date.now();
        } else {
            const review = {
                user: userId,
                name,
                rating: Number(rating),
                comment
            };
            product.reviews.push(review);
        }
        //Recalculate average rating;
        const totalRating = product.reviews.reduce((acc, item) => acc + item.rating, 0);
        product.averageRating = totalRating / product.reviews.length;

        await product.save();
        res.status(200).json({ message: 'Review submitted successfully"', product });
    } else {
        res.status(404).json({ message: "Product not found" });
    }
}

exports.UserReview = async (req, res, next) => {
    const userId = req.userId;
    const productId = req.query.productId;
    try {
        const product = await Product.findOne({ _id: productId }, {
            name: 1, // Include the product name
            'mainImage.url': 1, // Include the mainImage URL
            reviews: { $elemMatch: { user: userId } }
        })
        if (product) {
            return res.status(200).json(product)
        }
    } catch (error) {
        res.status(500).json('Server error')
    }
}