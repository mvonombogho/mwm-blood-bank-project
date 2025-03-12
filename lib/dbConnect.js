import mongoose from 'mongoose';

// Track connection status
let isConnected = false;

/**
 * Connect to MongoDB database
 */
async function dbConnect() {
  // If already connected, use existing connection
  if (isConnected) {
    return;
  }

  // Check for MongoDB URI in environment variables
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  try {
    // Set connection options
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI, opts);
    
    // Update connection status
    isConnected = conn.connections[0].readyState;
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw new Error('Error connecting to MongoDB');
  }
}

export default dbConnect;