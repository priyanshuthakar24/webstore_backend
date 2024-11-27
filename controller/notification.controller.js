const Notification = require('../models/notification.model')

exports.GetAllNotification = async (req, res, next) => {
    try {
        const notification = await Notification.find().sort({ date: -1 })
        res.status(200).json({ success: true, notification })
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.RemoveNotification = async (req, res, next) => {
    const id = req.query.id
    try {
        await Notification.findOneAndDelete(id);
        res.status(200).json({ success: true, message: 'Notification Remove' })
    } catch (error) {
        res.status(500).json(error)
    }
}