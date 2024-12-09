const Product = require('../models/product.model');

exports.GetAllProduct = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        try {
            const productlist = await Product.find().sort("-createdAt").skip(skip).limit(10).select('name description mainImage category mrp salePrice averageRating createdAt reviews')
            const totalCount = await Product.countDocuments();
            return res.status(200).json({ productlist, totalCount })
        } catch (error) {
            console.log(error)
            res.status(500).json(error)
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal Server Error' })
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
