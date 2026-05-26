import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached =
  globalWithMongoose.mongoose ||
  (globalWithMongoose.mongoose = {
    conn: null,
    promise: null,
  });

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MongoDB URI missing");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "webportfolio",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
