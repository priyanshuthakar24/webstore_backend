// routes/index.js
const authRoutes = require('./auth.api.route');
const adminRoutes = require('./admin.api.route');
const cartRoutes = require('./cart.api.route');
const orderRoutes = require('./order.api.route');
const NotificationRoute = require('./notification.api.route')
const WishlistRoute = require('./wishlist.api.route');
const SearchRoute = require('./search.api.route');
const UserRoute = require('./user.api.route');
const ReviewRoute = require('./review.api.route');

module.exports = (app) => {
    app.use('/api/user', UserRoute)
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/order', orderRoutes);
    app.use('/api/admin/notification', NotificationRoute);
    app.use('/api/wishlist', WishlistRoute);
    app.use('/api/search', SearchRoute);
    app.use('/api/review', ReviewRoute);
};
