import mongoose from 'mongoose';

/**
 * Connect to MongoDB database using Mongoose
 */
export const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri || mongoUri === 'your_mongodb_connection_string') {
    console.error('MongoDB Connection Error: MONGO_URI is not set. Please provide a valid MongoDB connection string in your .env file.');
    process.exit(1);
  }

  // Support in-memory MongoDB for local dev testing when specified
  if (mongoUri === 'memory') {
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      global.__MONGO_URI__ = mongoUri;
      console.log('Initialized in-memory MongoDB instance for development testing at', mongoUri);
    } catch (err) {
      console.error(`In-memory MongoDB Error: ${err.message}`);
      process.exit(1);
    }
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
