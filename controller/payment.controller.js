const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret: process.env.RAZORPAY_SECRET
})

exports.CreateOrder = async (req, res, next) => {
    const { amount } = req.body;

    try {
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: crypto.randomBytes(16).toString("hex")
        }
        const order = await razorpay.orders.create(options);
        res.status(200).json(order)
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error });
    }
}

exports.VerifyPayment = async (req, res, next) => {
    const { order_id, payment_id, signature } = req.body;
    const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(`${order_id}|${payment_id}`)
        .digest("hex");
    if (generatedSignature === signature) {
        // Update payment status in database
        // Assuming you have a database model `Order`
        await Order.updateOne({ razorpay_order_id: order_id }, { status: "paid", razorpay_payment_id: payment_id });
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: "Payment verification failed" });
    }
}