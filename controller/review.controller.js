const Product = require('../models/product.model');
exports.AddReview = async (req, res, nexxt) => {
    const { productId } = req.query;
    const { rating, comment } = req.body;
    const userId = req.userId;
    const product = await Product.findById(productId);

    if (product) {
        const alreadyReviewed = product.reviews.find(r => r.user.toString() === userId.toString())
        if (alreadyReviewed) {
            return res.status(400).json({ message: "Product already reviewed by user" });
        }
        const review = {
            user: userId,
            rating: Number(rating),
            comment
        };
        product.reviews.push(review);

        //Recalculate average rating;
        const totalRating = product.reviews.reduce((acc, item) => acc + item.rating, 0);
        product.averageRating = totalRating / product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review Added', product });
    } else {
        res.status(404).json({ message: "Product not found" });
    }
}