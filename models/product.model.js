const mongoose = require('mongoose');
const { newcategory } = require('../utils/dummy');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: [...newcategory], required: true },
    mrp: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    stock: [{ size: { type: String, required: true }, quantity: { type: Number, required: true } }],
    bulletPoints: { type: [String], required: true },
    mainImage: { url: String, public_id: String }, // Cloudinary URL
    subImages: [{ url: String, public_id: String }], // Cloudinary URLs for sub-images
    reviews: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            name: { type: String, required: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }
    ],
    averageRating: { type: Number, default: 0 },
}, { timestamps: true });


module.exports = mongoose.model("Product", productSchema);