const Order = require('../models/orders.model');
const Product = require('../models/product.model');
exports.SearchOrder = async (req, res, next) => {
    const { page = 1, limit = 20, search } = req.query;
    // const query = { lastSixOfId: new RegExp(search, 'i') }; // Search by city
    const query = search ? { lastSixOfId: { $regex: search, $options: 'i' } } : { isPaid: true };
    try {
        const orders = await Order.find(query).populate('user', 'name')
            .skip((page - 1) * limit)
            .limit(parseInt(limit)).sort({ createdAt: -1 })
            .exec();
        const totalCount = await Order.countDocuments(query);
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
        res.json({ result, totalCount });
    } catch (error) {
        res.status(500).send({ message: 'Error fetching orders', error });
    }
}

exports.SearchProduct = async (req, res, next) => {
    const { search } = req.query;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}

    try {
        const product = await Product.find(query)
        res.status(200).json(product)
    } catch (error) {
        res.status(500).send({ message: 'Error fetching orders', error });
    }
}