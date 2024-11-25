// routes/index.js
const authRoutes = require('./auth.api.route');
const adminRoutes = require('./admin.api.route');
const cartRoutes = require('./cart.api.route');
const orderRoutes = require('./order.api.route');
const Notification = require('./notification.api.route')
const Wishlist = require('./wishlist.api.route');
const Search = require('./search.api.route');
const UserRoute = require('./user.api.route');
// const { razorpayWebhook } = require('../controllers/webhookController');

module.exports = (app, io) => {
    app.use('/api/user', UserRoute)
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/order', orderRoutes);
    app.use('/api/admin/notification', Notification);
    app.use('/api/wishlist', Wishlist);
    app.use('/api/search', Search)
};
