const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;

    if (!connStr) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    const safeUri = connStr.replace(
      /\/\/([^:]+):([^@]+)@/,
      '//***:***@'
    );

    console.log(`Connecting to MongoDB Atlas at: ${safeUri}`);

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
      tls: true,
      retryWrites: true,
      w: 'majority',
    });

    console.log(
      `MongoDB Atlas Connected successfully to Host: ${conn.connection.host}`
    );
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
  }
};

module.exports = connectDB;