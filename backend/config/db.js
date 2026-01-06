const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to local MongoDB
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/library_management', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;