const express = require('express')
const router = express.Router()
router.use(express.urlencoded({ extended: true }))
const walletcontroller = require('../controller/walletController')
const { userBlocked,userSessionMiddleare }= require('../Middleware/userAuth')


router.get('/wallet',userBlocked,userSessionMiddleare,walletcontroller.walletPage)
router.post('/walletpayment',userBlocked,userSessionMiddleare,walletcontroller.walletpayment)


module.exports = router