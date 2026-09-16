import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  lastFailedAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache;
}

let cached: MongooseCache = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null, lastFailedAt: 0 };
}

// Cooldown period after a connection failure before attempting reconnection (30 seconds)
const FAILURE_COOLDOWN_MS = 30000;

export async function connectDB(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    return null;
  }

  // If already connected and ready, return immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If we failed recently, skip blocking reconnect attempts to prevent request stalling
  const now = Date.now();
  if (cached.lastFailedAt && now - cached.lastFailedAt < FAILURE_COOLDOWN_MS) {
    return null;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500, // Reduced from 4000ms for fast fallback
      connectTimeoutMS: 2000,         // Reduced from 5000ms
      socketTimeoutMS: 15000,
      maxPoolSize: 10,
      minPoolSize: 0,
      family: 4,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        cached.lastFailedAt = 0;
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn("[MongoDB] Atlas Connection warning (using fallback):", err.message || err);
        cached.lastFailedAt = Date.now();
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.lastFailedAt = Date.now();
    cached.promise = null;
    cached.conn = null;
    return null;
  }

  return cached.conn;
}