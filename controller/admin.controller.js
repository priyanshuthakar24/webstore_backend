const { validationResult } = require('express-validator')
const Product = require('../models/product.model')
const cloudinary = require('../utils/cloudinary')
exports.handleCreateProduct = async (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array() })
    }

    const { name, description, category, mrp, salePrice, stock, bulletPoints } = req.body;

    try {

        // Upload main image to Cloudinary
        const mainImageUpload = await cloudinary.uploader.upload(
            req.files.mainImage[0].path,
            { folder: "products" }
        )

        // Upload sub-images to Cloudinary
        const subImageUploads = await Promise.all(
            req.files.subImages.map((file) => cloudinary.uploader.upload(file.path, { folder: "products" }))
        );

        // Create new product document
        const newProduct = new Product({
            name,
            description,
            category,
            mrp,
            salePrice,
            stock,
            bulletPoints: JSON.parse(bulletPoints),
            mainImage: mainImageUpload.secure_url,
            subImages: subImageUploads.map((upload) => upload.secure_url),
        });
        
        // Save product to MongoDB
        await newProduct.save();
        return res.status(201).json({ success: true, message: 'Product Added Succesfully' });
    } catch (error) {
        console.error("Error uploading images or saving product:", error);
        res.status(500).json({ success: false, message: error.message })
    }

}