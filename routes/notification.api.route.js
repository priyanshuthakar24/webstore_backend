const router = require('express').Router()
const { GetAllNotification, RemoveNotification } = require('../controller/notification.controller');
const { VerifyAdmin } = require('../middleware/verifyToken')

//? '/api/admin/notification/...'

//! Get new Order List  
router.get('/neworder', VerifyAdmin, GetAllNotification)

//! Remove New Order From List 
router.delete('/remove', VerifyAdmin, RemoveNotification)


module.exports = router