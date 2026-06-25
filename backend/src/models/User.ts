import { Schema, model, type Document, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';

const BCRYPT_COST = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9_]+$/;

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fcmTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: USERNAME_REGEX,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: EMAIL_REGEX,
    },
    password: {
      type: String,
      required: true,
      select: false, // never returned unless explicitly .select('+password')
    },
    fcmTokens: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        // Never leak the hash or internal mongoose fields (CLAUDE.md §9).
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Hash the password whenever it is set/changed.
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, BCRYPT_COST);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = model<IUser>('User', userSchema);
