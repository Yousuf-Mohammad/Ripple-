import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { initFirebase } from './config/firebase';

async function start(): Promise<void> {
  try {
    await connectDB();
    initFirebase();

    const server = app.listen(env.PORT, () => {
      console.log(`[server] Ripple API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    });

    // Graceful shutdown.
    const shutdown = async (signal: string) => {
      console.log(`\n[server] ${signal} received — shutting down`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };
    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (err) {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
}

void start();
