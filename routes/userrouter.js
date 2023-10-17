const express = require('express')
const router = express.Router()
router.use(express.urlencoded({ extended: true }))
const usercontroller = require('../controller/userController')
const productController = require('../controller/productController')
const { userBlocked,userSessionMiddleare }= require('../Middleware/userAuth')



router.get('/home',usercontroller.home) 
router.post('/signup',usercontroller.usersignup)  
router.post('/otpverify',usercontroller.otpverify)  
router.post('/login',usercontroller.userlogin) 
router.get('/otpresend',usercontroller.resendOTP) 
router.get('/userssingleproduct',userBlocked,usercontroller.userssingleproduct) 
router.get('/viewall',userBlocked, usercontroller.viewall);
router.get('/logout', usercontroller.userlogout);
router.get('/search', usercontroller.search);
router.get('/cart',userBlocked,userSessionMiddleare, usercontroller.cart);
router.get('/addtocart/:userId/:productId',userSessionMiddleare,usercontroller.addToCart) 
router.get('/forgotpassword', usercontroller.forgotpassword);
router.post('/forgotpasswordotp',usercontroller.forgotpasswordotp) 
router.get('/forgotpasswordotppage', usercontroller.forgotpasswordotppage);
router.post('/forgototpverify',usercontroller.forgototpverify) 
router.get('/deleteProductCart/:userId/:productId',userSessionMiddleare,productController.deleteProductCart) 
router.get('/decreaseQuantity/:userId/:productId',userSessionMiddleare,usercontroller.decreaseQuantity) 
router.get('/profile',userBlocked,userSessionMiddleare,usercontroller.profile) 
router.post('/updateProfile',userSessionMiddleare,usercontroller.updateProfile)
router.post('/addAdress',userSessionMiddleare,usercontroller.addAdress)
router.get('/editAddress',usercontroller.editAdress)
router.post('/updateadress',usercontroller.updateadress)
router.get('/deleteAdress',usercontroller.deleteAdress)
router.get('/checkout',userBlocked,userSessionMiddleare,usercontroller.checkout)
router.post('/primary',usercontroller.primary)
router.get('/confirmOrder',userBlocked,userSessionMiddleare,usercontroller.confirmOrder)
router.get('/myOrder',userBlocked,userSessionMiddleare,usercontroller.myOrder)
router.get('/falser',usercontroller.falser)
router.get('/buyNow',userBlocked,userSessionMiddleare,usercontroller.buyNow)
router.get('/buyNoworder',userBlocked,userSessionMiddleare,usercontroller.buyNoworder)






























 



module.exports = router