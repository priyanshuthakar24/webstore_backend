const mongoose = require('mongoose');
const Schema = mongoose.Schema

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {

            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            },
            size: {
                type: String,
                required: true
            }
        }
    ],
    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    paymentInfo: {
        id: { type: String },// Razorpay Payment ID or other payment gateway ID
        status: { type: String },// Payment status (e.g., "paid", "pending")
        method: { type: String },
        contact: { type: String },
        cardlast4: { type: Number }
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    }
    ,
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ["Pending", "Packed", "Shipping", "Delivered"]
    },
    LogisticDetail: {
        logisticsName: { type: String },
        trackId: { type: String },
        paymentType: { type: String }
    },
    deliveredAt: {
        type: Date
    },
    lastSixOfId: {
        type: String,
        index: true,
    },
}, { timestamps: true });

// Middleware to automatically populate `lastSixOfId` before saving
orderSchema.pre('save', function (next) {
    this.lastSixOfId = this._id.toString().slice(-6); // Extract last 6 characters of ObjectId
    next();
});

module.exports = mongoose.model('Order', orderSchema);