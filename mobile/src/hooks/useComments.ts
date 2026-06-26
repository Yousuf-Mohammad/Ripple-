import { useCallback, useEffect, useRef, useState } from 'react';
import { getComments } from '../api/posts.api';
import { ApiError, type Comment } from '../api/types';

const LIMIT = 20;

export type CommentsStatus = 'loading' | 'success' | 'error';

export interface UseCommentsResult {
  comments: Comment[];
  status: CommentsStatus;
  error: string | null;
  loadingMore: boolean;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
  /** Append a locally-created comment to the end (newest). */
  append: (comment: Comment) => void;
}

/**
 * Paginated comments for one post, oldest-first. Mirrors useFeed but appends
 * newer pages (and freshly-added comments) at the end. Generation counter guards
 * against stale responses.
 */
export function useComments(postId: string): UseCommentsResult {
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<CommentsStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(1);
  const genRef = useRef(0);
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    const gen = ++genRef.current;
    loadingRef.current = true;
    setStatus('loading');
    setLoadingMore(false);
    setError(null);
    try {
      const res = await getComments(postId, { page: 1, limit: LIMIT });
      if (gen !== genRef.current) return;
      setComments(res.data);
      pageRef.current = res.page;
      setHasMore(res.hasMore);
      setStatus('success');
    } catch (e) {
      if (gen !== genRef.current) return;
      setError(e instanceof ApiError ? e.message : 'Could not load comments.');
      setStatus('error');
    } finally {
      if (gen === genRef.current) loadingRef.current = false;
    }
  }, [postId]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || status !== 'success') return;
    const gen = genRef.current;
    loadingRef.current = true;
    setLoadingMore(true);
    try {
      const res = await getComments(postId, { page: pageRef.current + 1, limit: LIMIT });
      if (gen !== genRef.current) return;
      setComments((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        return [...prev, ...res.data.filter((c) => !seen.has(c.id))];
      });
      pageRef.current = res.page;
      setHasMore(res.hasMore);
    } catch {
      // keep what we have
    } finally {
      if (gen === genRef.current) {
        loadingRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [hasMore, status, postId]);

  const append = useCallback((comment: Comment) => {
    setComments((prev) =>
      prev.some((c) => c.id === comment.id) ? prev : [...prev, comment],
    );
  }, []);

  return { comments, status, error, loadingMore, hasMore, refresh: load, loadMore, append };
}
