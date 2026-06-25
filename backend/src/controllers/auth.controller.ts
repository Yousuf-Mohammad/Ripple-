import type { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { signToken } from '../utils/jwt';
import type { SignupInput, LoginInput } from '../validators/auth.schema';

interface MongoDuplicateError {
  code?: number;
}

/** POST /auth/signup — create a user and return { user, token }. */
export async function signup(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body as SignupInput;

  let user;
  try {
    user = await User.create({ username, email, password });
  } catch (err) {
    if ((err as MongoDuplicateError).code === 11000) {
      throw new ApiError(409, 'USER_EXISTS', 'Username or email is already taken');
    }
    throw err;
  }

  const token = signToken(user.id);
  res.status(201).json({ user: user.toJSON(), token });
}

/** POST /auth/login — authenticate by email or username, return { user, token }. */
export async function login(req: Request, res: Response): Promise<void> {
  const { emailOrUsername, password } = req.body as LoginInput;
  const identifier = emailOrUsername.toLowerCase();

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const token = signToken(user.id);
  res.json({ user: user.toJSON(), token });
}

/** GET /auth/me — return the authenticated user. */
export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }
  res.json({ user: user.toJSON() });
}
