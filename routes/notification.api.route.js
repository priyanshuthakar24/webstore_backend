const router = require('express').Router()
const { GetAllNotification, RemoveNotification } = require('../controller/notification.controller');
const { VerifyAdmin } = require('../middleware/verifyToken')
router.get('/neworder', VerifyAdmin, GetAllNotification)
router.delete('/remove', VerifyAdmin, RemoveNotification)


module.exports = router