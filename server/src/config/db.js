const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Do not exit process in serverless environment
        // process.exit(1);
        throw error;
    }
};

module.exports = connectDB;
