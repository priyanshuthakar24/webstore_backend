const router = require('express').Router()
const { GetAllNotification, RemoveNotification } = require('../controller/notification.controller');
router.get('/neworder', GetAllNotification)
router.delete('/remove', RemoveNotification)


module.exports = router