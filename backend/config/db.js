import mongoose from 'mongoose';
import net from 'net';

let mongoMemoryServerInstance = null;

const isLocalPortListening = (port = 27017, host = '127.0.0.1', timeout = 400) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
};

const startEmbeddedMongoDB = async () => {
  if (mongoMemoryServerInstance) {
    return mongoMemoryServerInstance.getUri();
  }
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  mongoMemoryServerInstance = await MongoMemoryServer.create();
  const uri = mongoMemoryServerInstance.getUri();
  console.log(`[Database] Embedded MongoDB running at ${uri}`);
  return uri;
};

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    const isLocalhostUri =
      !mongoUri ||
      mongoUri.includes('localhost:27017') ||
      mongoUri.includes('127.0.0.1:27017');

    if (isLocalhostUri) {
      // Fast probe to check if a local standalone MongoDB daemon is running
      const isListening = await isLocalPortListening(27017);
      if (!isListening) {
        console.log(
          '[Database] No active daemon on port 27017. Initializing embedded in-memory MongoDB...'
        );
        mongoUri = await startEmbeddedMongoDB();
      }
    }

    if (!mongoUri || mongoUri.trim() === '') {
      mongoUri = await startEmbeddedMongoDB();
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] Connected to MongoDB (${conn.connection.host})`);
    return conn;
  } catch (error) {
    console.warn(`[Database] Connection warning (${error.message}). Activating fallback instance...`);
    try {
      const fallbackUri = await startEmbeddedMongoDB();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`[Database] Connected to fallback MongoDB (${fallbackUri})`);
      return conn;
    } catch (fallbackError) {
      console.error('[Database] Failed to initialize fallback MongoDB:', fallbackError.message);
      throw fallbackError;
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};

export default connectDB;
