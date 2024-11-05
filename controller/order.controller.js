const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/orders.model');
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

exports.createRazorpayOrder = async (req, res, next) => {
    const { orderItems, shippingInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    try {
        // Create a new order in Razorpay with the amount and currency
        const options = {
            amount: totalPrice * 100,// Razorpay requires the amount in paisa
            currency: "INR",
            receipt: crypto.randomBytes(16).toString("hex")
        }
        const razorpayOrder = await razorpay.orders.create(options);
        // Save the order in our database with the generated Razorpay order_id
        const newOrder = new Order({
            user: req.user._id,
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo: {
                id: razorpayOrder.id,
                status: 'created'
            }
        })
        const createdOrder = await newOrder.save();
        // Send the Razorpay order details to the frontend
        res.status(201).json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            order: createdOrder
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating  Razorpay order", error });
    }
}

exports.verifyRazorpayPayment = async (req, res, next) => {
    const { order_id, payment_id, razorpay_signature } = req.body;
    try {
        // Generate the signature to verify Razorpay's response
        const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${order_id}|${payment_id}`)
            .digest("hex");

        // Check if the signature matches
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // Find the order by Razorpay order_id and update payment status
        const order = await Order.findOne({ "paymentInfo.id": order_id });

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentInfo.status = "paid";
            order.paymentInfo.id = payment_id;

            const updatedOrder = await order.save();

            res.json({ success: true, order: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Payment verification error', error });
    }
};