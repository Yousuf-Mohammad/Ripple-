import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Post, type IPost } from '../models/Post';
import { User } from '../models/User';
import { getPagination, buildPage } from '../utils/pagination';
import type { CreatePostInput } from '../validators/post.schema';

interface PopulatedAuthor {
  _id: Types.ObjectId;
  username: string;
}

/**
 * Shape a post for the API. Drops the raw `likes` array, exposing only
 * `likeCount` and the requesting user's `likedByMe` flag (CLAUDE.md §5.3).
 */
function serializePost(post: IPost, currentUserId: string) {
  const author = post.author as unknown as PopulatedAuthor;
  return {
    id: post.id as string,
    author: { id: author._id.toString(), username: author.username },
    text: post.text,
    likeCount: post.likes.length,
    likedByMe: post.likes.some((id) => id.equals(currentUserId)),
    commentCount: post.commentCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

/** POST /posts — create a text post and return it with the author populated. */
export async function createPost(req: Request, res: Response): Promise<void> {
  const { text } = req.body as CreatePostInput;

  const post = await Post.create({ author: req.user!.id, text });
  await post.populate('author', 'username');

  res.status(201).json({ post: serializePost(post, req.user!.id) });
}

/** GET /posts — paginated feed, newest first, optional username filter. */
export async function getFeed(req: Request, res: Response): Promise<void> {
  const { page, limit, skip } = getPagination(req.query);
  const username = req.query.username as string | undefined;

  let filter: Record<string, unknown> = {};
  if (username) {
    const author = await User.findOne({ username }).select('_id');
    // Unknown username → empty page, not a 404 (CLAUDE.md feed rule).
    if (!author) {
      res.json(buildPage([], 0, { page, limit }));
      return;
    }
    filter = { author: author._id };
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username'),
    Post.countDocuments(filter),
  ]);

  const data = posts.map((post) => serializePost(post, req.user!.id));
  res.json(buildPage(data, total, { page, limit }));
}
