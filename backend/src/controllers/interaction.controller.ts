import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Post } from '../models/Post';
import { Comment, type IComment } from '../models/Comment';
import { ApiError } from '../utils/ApiError';
import { getPagination, buildPage } from '../utils/pagination';
import { notifyOnLike, notifyOnComment } from '../services/notification.service';
import type { CreateCommentInput } from '../validators/comment.schema';

interface PopulatedAuthor {
  _id: Types.ObjectId;
  username: string;
}

/** Shape a comment for the API; author populated with username only. */
function serializeComment(comment: IComment) {
  const author = comment.author as unknown as PopulatedAuthor;
  return {
    id: comment.id as string,
    post: comment.post.toString(),
    author: { id: author._id.toString(), username: author.username },
    text: comment.text,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

/** POST /posts/:id/like — toggle the caller's like on a post. */
export async function toggleLike(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  const already = post.likes.some((l) => l.equals(userId));
  const update = already ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };
  const updated = await Post.findByIdAndUpdate(post.id, update, { new: true });
  const liked = !already;
  const likeCount = updated?.likes.length ?? 0;

  // Notify only on a new like (not on unlike/re-like); service skips self (§4.3).
  if (liked) {
    void notifyOnLike(post, userId);
  }

  res.json({ liked, likeCount });
}

/** POST /posts/:id/comment — add a comment and bump the post's commentCount. */
export async function addComment(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { text } = req.body as CreateCommentInput;

  const post = await Post.findById(req.params.id);
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  const comment = await Comment.create({ post: post.id, author: userId, text });
  await Post.updateOne({ _id: post.id }, { $inc: { commentCount: 1 } });
  await comment.populate('author', 'username');

  // Service skips self (§4.3); fire-and-forget so a send never breaks the request.
  void notifyOnComment(post, userId, text);

  res.status(201).json({ comment: serializeComment(comment) });
}

/** GET /posts/:id/comments — paginated comments for a post, oldest first. */
export async function getComments(req: Request, res: Response): Promise<void> {
  const { page, limit, skip } = getPagination(req.query);

  const post = await Post.findById(req.params.id).select('_id');
  if (!post) {
    throw ApiError.notFound('Post not found');
  }

  const [comments, total] = await Promise.all([
    Comment.find({ post: post._id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username'),
    Comment.countDocuments({ post: post._id }),
  ]);

  const data = comments.map((c) => serializeComment(c));
  res.json(buildPage(data, total, { page, limit }));
}
