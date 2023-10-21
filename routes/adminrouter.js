const express = require('express')
const router = express.Router()
router.use(express.urlencoded({ extended: true }))
const admincontroller = require('../controller/adminController')
const productController = require('../controller/productController')
const { adminSessionMiddleware }= require('../Middleware/adminAuth')

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

 

router.get('/admindashbord',adminSessionMiddleware,admincontroller.adminhome) 
router.get('/adminusers',adminSessionMiddleware,admincontroller.adminusers) 
router.get('/adminproducts',adminSessionMiddleware,productController.adminproducts) 
router.post('/addproduct', upload.array('image',4), productController.addProduct);
router.get('/admin',admincontroller.adminlogin) 
router.post('/adminloginpost',admincontroller.adminloginpost) 
router.get('/adminlogout',admincontroller.adminlogout) 
router.post('/addCategory',adminSessionMiddleware,productController.addCategory) 
router.get('/productedit',adminSessionMiddleware,productController.productedit) 
router.post('/updateProduct/:productId',adminSessionMiddleware, productController.updateProduct)
router.get('/productdelete',adminSessionMiddleware,productController.productdelete) 
router.get('/userblock/:userId',admincontroller.userblock) 
router.get('/userunblock/:userId',admincontroller.userunblock) 
router.get('/adminCatageory',admincontroller.adminCatageory) 
router.get('/catageoryedit/:catageoryId',adminSessionMiddleware,admincontroller.catageoryedit) 
router.post('/updatecatageory/:catageoryId',admincontroller.updatecatageory) 
router.get('/deleteCatageory/:catageoryId',admincontroller.deleteCatageory) 
router.get('/productImageEdit',adminSessionMiddleware,productController.productImageEdit) 
router.get('/orders',adminSessionMiddleware,admincontroller.orders) 
router.get('/stockPage',adminSessionMiddleware,productController.stockPage) 
router.get('/listProduct',adminSessionMiddleware,productController.listProduct) 
router.get('/unlistproduct',adminSessionMiddleware,productController.unlistproduct) 
router.get('/count',adminSessionMiddleware,productController.count) 


























 



module.exports = router