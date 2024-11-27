const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/orders.model');
const Product = require('../models/product.model');
const Notification = require('../models/notification.model');
// const io = require('../app')
const { validateStock } = require('../utils/validateStock ')

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

exports.createRazorpayOrder = async (req, res, next) => {
    const { orderItems, shippingInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
    try {

        const isStockAvailable = await validateStock(orderItems)
        if (!isStockAvailable) {
            return res.status(400).json({ message: 'Insufficient stock for one or more items.' });
        }
        // Create a new order in Razorpay with the amount and currency
        const options = {
            amount: totalPrice * 100,// Razorpay requires the amount in paisa
            currency: "INR",
            receipt: crypto.randomBytes(16).toString("hex")
        }
        const razorpayOrder = await razorpay.orders.create(options);
        // Save the order in our database with the generated Razorpay order_id
        const newOrder = new Order({
            user: req.userId,
            orderItems,
            shippingInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentInfo: {
                id: razorpayOrder.id,
                status: 'pending'
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

// verify razorypay payment using  api 
// //!if the webhook is not working than 
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
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentInfo.status = "paid";
        order.paymentInfo.id = payment_id;
        const updatedOrder = await order.save();
        // Update the product stock based on order items
        const updateStockPromises = order.orderItems.map(async (item) => {
            const product = await Product.findById(item.product);
            if (product) {
                const stockIndex = product.stock.findIndex(stockItem => stockItem.size === item.size);
                if (stockIndex >= 0) {
                    product.stock[stockIndex].quantity -= item.quantity;
                    if (product.stock[stockIndex].quantity < 0) {
                        product.stock[stockIndex].quantity = 0; // Ensure stock doesn't go negative
                    }
                    await product.save();
                }
            }
        });
        await Promise.all(updateStockPromises);
        // Emit an update event to the admin via WebSocket
        req.io.emit("orderUpdate", { message: "Order paid", order });
        // Notify admin of a new order
        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Payment verification error', error });
    }
};


// verify payment using webhook 
exports.razorpayWebhook = async (req, res, next) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    // Verify Razorpay signature
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
        return res.status(400).json({ message: "Invalid signature" });
    }
    console.log('Webhook request received:', JSON.stringify(req.body, null, 2));
    const event = req.body.event;

    if (event === 'order.paid') {
        console.log('Method  Call')
        const { id } = req.body.payload.order.entity;
        const { method, contact, card } = req.body.payload.payment.entity;
        console.log(contact)
        try {
            // Find the order in the database
            const order = await Order.findOne({ "paymentInfo.id": id }).populate('user', 'name');
            if (!order) return res.status(404).json({ message: "Order not found" });

            // Update order status
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentInfo.status = "paid";
            order.paymentInfo.method = method;
            order.paymentInfo.contact = contact;
            order.paymentInfo.cardlast4 = card?.last4
            await order.save();

            // Update product stock quantities
            const updateStockPromises = order.orderItems.map(async (item) => {
                const product = await Product.findById(item.product);
                if (product) {
                    const stockIndex = product.stock.findIndex(stock => stock.size === item.size);
                    if (stockIndex >= 0) {
                        product.stock[stockIndex].quantity -= item.quantity;
                        if (product.stock[stockIndex].quantity < 0) {
                            product.stock[stockIndex].quantity = 0;
                        }
                        await product.save();
                    }
                }
            });

            await Promise.all(updateStockPromises);
            // Notify admin of a new order
            const ordermessage = `New Order Arrived # ${order.lastSixOfId}`
            const notification = new Notification({ message: ordermessage, orderId: order._id });
            await notification.save();
            const result = {
                orderId: order._id,
                customerName: order.user.name,
                orderDate: order.paidAt.toLocaleString(),
                paymentId: order.paymentInfo.id,
                paymentStatus: order.paymentInfo.status,
                totalAmount: order.totalPrice,
                shippingStatus: order.status
            }
            // Emit an update event to the admin via WebSocket
            req.io.emit("orderUpdate", { message: "Order paid", result });

            res.json({ message: "Order processed and admin notified" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error processing order" });
        }
    } else {
        res.status(400).json({ message: "Unhandled event type" });
    }
};

// get the all order list 
exports.getAllOrders = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit;
    try {
        const orders = await Order.find({ isPaid: true }).populate('user', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit);
        const totalCount = await Order.find({ isPaid: true }).countDocuments();
        // console.log(orders)
        const result = orders.map((order) => (
            {
                orderId: order._id,
                customerName: order.user.name,
                orderDate: order.paidAt.toLocaleString(),
                paymentId: order.paymentInfo.id,
                paymentStatus: order.paymentInfo.status,
                totalAmount: order.totalPrice,
                shippingStatus: order.status
            }
        ))
        res.status(200).json({ result, totalCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
};

// update the order shipping status 
exports.UpdateStatus = async (req, res) => {
    const { status } = req.body;
    console.log(status)
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;

        if (status === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();
        res.json({ success: true, message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status', error });
    }
}

// Get the order detail 
exports.GetOrderDetail = async (req, res, next) => {
    const id = req.query.id
    try {
        const orderDetail = await Order.findById(id).populate('orderItems.product user', 'name salePrice mainImage.url name email')
        return res.status(200).json(orderDetail)
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.UpdateLogistics = async (req, res, next) => {
    const values = req.body
    const id = req.query.id
    const LogisticDetail = values
    try {
        const orderdata = await Order.findById(id)
        orderdata.LogisticDetail = LogisticDetail
        // if (!orderdata) return res.status(404).json("No Order Found!")F
        await orderdata.save();
        res.status(200).json({ success: true, message: 'Detail updated', data: orderdata.LogisticDetail })
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.GetUserOrder = async (req, res, next) => {
    const user = req.userId;
    const orderdata = await Order.find({ user, isPaid: true }).sort({ createdAt: -1 }).populate('orderItems.product', 'mainImage.url name')
    if (!orderdata) res.status(200).json({ success: false, message: "No order Found" })
    res.status(200).json(orderdata)
}