const express = require('express')
const router = express.Router()
router.use(express.urlencoded({ extended: true }))
const productController = require('../controller/productController')
const { adminSessionMiddleware }= require('../Middleware/adminAuth')
const { userSessionMiddleare }= require('../Middleware/userAuth')


const multer = require('multer');
// multer 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get('/adminproducts',adminSessionMiddleware,productController.adminproducts) 
router.post('/addproduct', upload.array('image',4), productController.addProduct);
router.post('/addCategory',adminSessionMiddleware,productController.addCategory) 
router.get('/productedit',adminSessionMiddleware,productController.productedit) 
router.post('/updateProduct/:productId',adminSessionMiddleware, productController.updateProduct)
router.get('/productdelete',adminSessionMiddleware,productController.productdelete) 
router.get('/productImageEdit',adminSessionMiddleware,productController.productImageEdit) 
router.get('/stockPage',adminSessionMiddleware,productController.stockPage) 
router.get('/listProduct',adminSessionMiddleware,productController.listProduct) 
router.get('/unlistproduct',adminSessionMiddleware,productController.unlistproduct) 
router.get('/count',adminSessionMiddleware,productController.count) 
router.get('/deleteProductCart/:userId/:productId',userSessionMiddleare,productController.deleteProductCart) 
router.get('/cancelorder',userSessionMiddleare,productController.cancelOrder) 
router.post('/addwishlist',userSessionMiddleare,productController.addwishlist)
router.delete('/wishlist/:productId',userSessionMiddleare, productController.deleteFromWishlist);









module.exports = router 