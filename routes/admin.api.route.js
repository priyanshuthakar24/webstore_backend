const router = require('express').Router();
const { HandleCreateProduct, FetchAllProduct, ProductDetail, updateProducts, DeleteProduct } = require('../controller/admin.controller');

const upload = require('../utils/multer');
const { VerifyAdmin } = require('../middleware/verifyToken')

const { body } = require('express-validator');

//? '/api/admin/...'

//! Add New Product
router.post('/addproduct', VerifyAdmin, upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
]), [
    body("name").notEmpty().withMessage("Product name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("mrp").isNumeric().withMessage("MRP should be a number"),
    body("salePrice").isNumeric().withMessage("Sale Price should be a number"),
], HandleCreateProduct)

//! Update the Product Detail
router.put('/products/:id', VerifyAdmin, upload.fields([{ name: 'mainImage', maxCount: 1 },
{ name: 'subImages', maxCount: 3 }
]), updateProducts);

//! Delete Produt 
router.delete('/deleteproduct/:id', VerifyAdmin, DeleteProduct);

//! Get All Product For Admin
router.get('/allproduct', VerifyAdmin, FetchAllProduct);

//! Get Product Detail
router.get('/productdetail', VerifyAdmin, ProductDetail);

module.exports = router