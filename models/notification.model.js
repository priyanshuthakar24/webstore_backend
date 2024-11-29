const mongoose = require('mongoose');
const Schema = mongoose.Schema

const notificationSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'orders',
        required: true
    }

})
module.exports = mongoose.model('Notification', notificationSchema);