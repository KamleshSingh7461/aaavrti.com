import mongoose from 'mongoose';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the DATABASE_URL environment variable inside .env'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Fix connection string if needed for Mongoose
    const uri = MONGODB_URI?.replace('.net/?', '.net/aaavrti?').replace('.net?', '.net/aaavrti?') || '';

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

// Helper for connection check (kept for compatibility with existing code)
export async function checkDatabaseConnection() {
    try {
        await dbConnect();
        return mongoose.connection.readyState === 1; // 1 = connected
    } catch (e) {
        console.error("Database connection failed:", e);
        return false;
    }
}
