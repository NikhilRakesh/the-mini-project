const express = require('express')
const router = express.Router()
router.use(express.urlencoded({ extended: true }))
const couponController = require('../controller/couponController')
const { adminSessionMiddleware }= require('../Middleware/adminAuth')
const { userBlocked,userSessionMiddleare }= require('../Middleware/userAuth')



router.get('/couponpage',adminSessionMiddleware,couponController.CouponPage)
router.post('/CreateCoupon',adminSessionMiddleware,couponController.CreateCoupon)
router.post('/RedeemCoupon',userBlocked,userSessionMiddleare,couponController.RedeemCoupon)
router.get('/offerPage',userBlocked,userSessionMiddleare,couponController.offerPage)


module.exports = router