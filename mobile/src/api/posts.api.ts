import { apiClient } from './client';
import type { Comment, Page, Post } from './types';

export interface FeedParams {
  page?: number;
  limit?: number;
  /** Filter to a single author; omitted/blank means all posts. */
  username?: string;
}

/** GET /posts 🔒 — paginated feed, newest first. */
export async function getFeed({ page, limit, username }: FeedParams = {}): Promise<Page<Post>> {
  const params: Record<string, string | number> = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (username && username.trim()) params.username = username.trim();

  const { data } = await apiClient.get<Page<Post>>('/posts', { params });
  return data;
}

/** POST /posts 🔒 — create a text post; returns it with the author populated. */
export async function createPost(text: string): Promise<Post> {
  const { data } = await apiClient.post<{ post: Post }>('/posts', { text });
  return data.post;
}

/** POST /posts/:id/like 🔒 — toggle the caller's like; returns the new state. */
export async function toggleLike(
  postId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  const { data } = await apiClient.post<{ liked: boolean; likeCount: number }>(
    `/posts/${postId}/like`,
  );
  return data;
}

/** GET /posts/:id/comments 🔒 — paginated comments, oldest first. */
export async function getComments(
  postId: string,
  { page, limit }: { page?: number; limit?: number } = {},
): Promise<Page<Comment>> {
  const params: Record<string, number> = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;

  const { data } = await apiClient.get<Page<Comment>>(`/posts/${postId}/comments`, { params });
  return data;
}

/** POST /posts/:id/comment 🔒 — add a comment; returns it with the author populated. */
export async function addComment(postId: string, text: string): Promise<Comment> {
  const { data } = await apiClient.post<{ comment: Comment }>(`/posts/${postId}/comment`, {
    text,
  });
  return data.comment;
}
