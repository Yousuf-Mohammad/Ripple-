import { Schema, model, Types, type Document, type Model } from 'mongoose';

export interface IPost extends Document {
  author: Types.ObjectId;
  text: string;
  likes: Types.ObjectId[];
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },
    likes: {
      // Stored on the post — deliberate small-scale tradeoff (CLAUDE.md §4.4).
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    commentCount: {
      // Denormalized for cheap feed rendering; maintained on comment add (P3).
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Feed is sorted newest-first; index supports it (CLAUDE.md §5.5).
postSchema.index({ createdAt: -1 });

export const Post: Model<IPost> = model<IPost>('Post', postSchema);
