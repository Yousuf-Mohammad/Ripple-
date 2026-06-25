import type { Request, Response } from 'express';
import { Post } from '../models/Post';
import { ApiError } from '../utils/ApiError';
import { notifyOnLike } from '../services/notification.service';

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
