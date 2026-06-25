import mongoose from 'mongoose';
import { env } from './env';

/**
 * Connect to MongoDB. Throws on failure so the caller (server bootstrap) can
 * decide to exit. Logs lifecycle events for visibility.
 */
export async function connectDB(): Promise<void> {
  mongoose.connection.on('connected', () => {
    console.log('[db] MongoDB connected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected');
  });

  await mongoose.connect(env.MONGODB_URI);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
