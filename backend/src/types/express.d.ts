// Augment Express's Request with the authenticated user's id (set by auth middleware).
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

export {};
