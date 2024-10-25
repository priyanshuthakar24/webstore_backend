const { validationResult } = require('express-validator')
const Product = require('../models/product.model')
const cloudinary = require('../utils/cloudinary')
exports.HandleCreateProduct = async (req, res, next) => {
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
            mainImage: { url: mainImageUpload.secure_url, public_id: mainImageUpload.public_id },
            subImages: subImageUploads.map((upload) => ({ url: upload.secure_url, public_id: upload.public_id })),
        });

        // Save product to MongoDB
        await newProduct.save();
        return res.status(201).json({ success: true, message: 'Product Added Succesfully' });
    } catch (error) {
        console.error("Error uploading images or saving product:", error);
        res.status(500).json({ success: false, message: error })
    }

}

exports.FetchAllProduct = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        const productlist = await Product.find().sort("-createdAt").skip(skip).limit(limit)
        const totalCount = await Product.countDocuments();
        return res.status(200).json({ productlist, totalCount })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

exports.ProductDetail = async (req, res, next) => {
    const { id } = req.query
    try {
        const productdetail = await Product.findById(id)
        return res.status(201).json(productdetail)
    } catch (error) {
        res.status(500).json(error);
    }

}

exports.updateProducts = async (req, res, next) => {
    try {
        console.log(req.body);
        const { id } = req.params
        const { name, description, category, mrp, salePrice, stock, bulletPoints } = req.body;


        // Parse bullet points if they are sent as JSON
        const parsedBulletPoints = JSON.parse(bulletPoints || "[]");


        // Retrieve the current product from the database
        const currentProduct = await Product.findById(id);
        if (!currentProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const updatedProduct = {
            name,
            description,
            category,
            mrp,
            salePrice,
            stock,
            bulletPoints: parsedBulletPoints,
        };


        // Handle main image upload and deletion of old image if needed
        if (req.files.mainImage) {
            if (currentProduct.mainImage.public_id) {
                await cloudinary.uploader.destroy(currentProduct.mainImage.public_id);
            }

            const mainImageUpload = await cloudinary.uploader.upload(req.files.mainImage[0].path, { folder: 'proudcts' });
            updatedProduct.mainImage = {
                url: mainImageUpload.url,
                public_id: mainImageUpload.public_id
            }
        }

        // Handle sub-images upload and selectively update or add new sub-images
        let updatedSubImages = [...currentProduct.subImages];

        if (req.files.subImages) {

            // Delete only the replaced sub-images, if any
            req.files.subImages.forEach((file, index) => {
                if (updatedSubImages[index] && updatedSubImages[index].public_id) {
                    cloudinary.uploader.destroy(updatedSubImages[index].public_id);
                }
            })
            const subImageUpload = await Promise.all(
                req.files.subImages.map((file) => cloudinary.uploader.upload(file.path, { folder: 'products' }))
            )
            subImageUpload.forEach((img, index) => {
                updatedSubImages[index] = {
                    url: img.secure_url,
                    public_id: img.public_id,
                };
            });
            updatedProduct.subImages = updatedSubImages;
            // if (currentProduct.subImages && currentProduct.subImages.length > 0) {
            //     await Promise.all(
            //         currentProduct.subImages.map((img) => cloudinary.uploader.destroy(img.public_id))
            //     );
            // }
            //Upload new sub-images

            // const subImageUpload = await Promise.all(
            //     req.files.subImages.map((file) => cloudinary.uploader.upload(file.path, { folder: 'products' }))
            // );
            //     updatedProduct.subImages = subImageUpload.map((img) => ({
            //         url: img.secure_url,
            //         public_id: img.public_id
            //     }));
        }
        //Find the produuct bt Id and Update

        const product = await Product.findByIdAndUpdate(id, updatedProduct, { new: true });
        res.status(200).json({ message: "Product updated successfully", product })
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "An error occurred while updating the product." });
    }
}

exports.DeleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params
        await Product.findByIdAndDelete( id );
        return res.status(200).json({ message: "News removed successfully" });
    } catch (error) {
        res.status(500).json(error)
    }
}