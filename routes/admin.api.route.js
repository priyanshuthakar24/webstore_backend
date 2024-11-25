const router = require('express').Router();
const { body } = require('express-validator');
const { HandleCreateProduct, FetchAllProduct, ProductDetail, updateProducts, DeleteProduct } = require('../controller/admin.controller');
const upload = require('../utils/multer');
const { VerifyAdmin } = require('../middleware/verifyToken')
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

router.get('/allproduct', VerifyAdmin, FetchAllProduct);
router.get('/productdetail', VerifyAdmin, ProductDetail);
router.put('/products/:id', VerifyAdmin, upload.fields([{ name: 'mainImage', maxCount: 1 },
{ name: 'subImages', maxCount: 3 }
]), updateProducts);
router.delete('/deleteproduct/:id', VerifyAdmin, DeleteProduct);

module.exports = router