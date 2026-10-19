import mongoose from 'mongoose';

let connection: Promise<typeof mongoose> | undefined;

mongoose.connection.on('error', error => console.error('MongoDB connection error:', error.message));
mongoose.connection.on('disconnected', () => { connection = undefined; });

const connectDB = (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (connection) return connection;
  if (!process.env.MONGO_URI) return Promise.reject(new Error('MONGO_URI environment variable is not set'));
  connection = mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 20,
    minPoolSize: 2,
    maxConnecting: 4,
    waitQueueTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }).then(conn => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  }).catch(error => {
    connection = undefined;
    throw error;
  });
  return connection;
};

export default connectDB;
