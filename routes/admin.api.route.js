const router = require('express').Router();
const { body } = require('express-validator');
const { HandleCreateProduct, FetchAllProduct, ProductDetail } = require('../controller/admin.controller');
const upload = require('../utils/multer');

router.post('/products', upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 3 },
]), [
    body("name").notEmpty().withMessage("Product name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("mrp").isNumeric().withMessage("MRP should be a number"),
    body("salePrice").isNumeric().withMessage("Sale Price should be a number"),
    body("stock").isNumeric().withMessage("Stock should be a number"),
], HandleCreateProduct)

router.get('/allproduct', FetchAllProduct);
router.get('/productdetail', ProductDetail)

module.exports = router