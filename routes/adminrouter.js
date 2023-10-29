const express = require('express')
const router = express.Router()
router.use(express.urlencoded({ extended: true }))
const admincontroller = require('../controller/adminController')
const { adminSessionMiddleware }= require('../Middleware/adminAuth')


 

router.get('/admindashbord',adminSessionMiddleware,admincontroller.adminhome) 
router.get('/adminusers',adminSessionMiddleware,admincontroller.adminusers) 
router.get('/admin',admincontroller.adminlogin) 
router.post('/adminloginpost',admincontroller.adminloginpost) 
router.get('/adminlogout',admincontroller.adminlogout) 
router.get('/userblock/:userId',admincontroller.userblock) 
router.get('/userunblock/:userId',admincontroller.userunblock) 
router.get('/adminCatageory',admincontroller.adminCatageory) 
router.get('/catageoryedit/:catageoryId',adminSessionMiddleware,admincontroller.catageoryedit) 
router.post('/updatecatageory/:catageoryId',admincontroller.updatecatageory) 
router.get('/deleteCatageory/:catageoryId',admincontroller.deleteCatageory) 
router.get('/orders',adminSessionMiddleware,admincontroller.orders) 



























 



module.exports = router