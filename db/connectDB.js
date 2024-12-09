const mongoose = require('mongoose');
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.c77xwlg.mongodb.net/${process.env.MONGODB_DEFAULT_DATABASE}`;

exports.connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};