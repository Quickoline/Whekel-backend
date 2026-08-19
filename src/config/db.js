import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/whekel_db');
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error]: ${error.message}`);
    // If local MongoDB is not running, warn but allow server launch with warning
    console.warn(`[MongoDB Warning]: Continuing in standalone mode. Note: DB operations require MongoDB.`);
  }
};
