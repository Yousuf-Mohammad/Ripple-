import { useCallback, useEffect, useRef, useState } from 'react';
import { getFeed } from '../api/posts.api';
import { ApiError, type Post } from '../api/types';

const LIMIT = 20;

export type FeedStatus = 'loading' | 'success' | 'error';

export interface UseFeedResult {
  posts: Post[];
  status: FeedStatus;
  error: string | null;
  refreshing: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
  /** P9: patch a post in place (e.g. after a like toggle). */
  updatePost: (id: string, patch: Partial<Post>) => void;
  /** P8: prepend a freshly created post. */
  prependPost: (post: Post) => void;
}

/**
 * Feed state for a given `username` filter (blank = all). Loads page 1 on mount
 * and whenever `username` changes; `loadMore` appends the next page; `refresh`
 * reloads page 1. A generation counter discards responses from superseded loads
 * so a fast filter change can't be clobbered by an in-flight request.
 */
export function useFeed(username: string): UseFeedResult {
  const [posts, setPosts] = useState<Post[]>([]);
  const [status, setStatus] = useState<FeedStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const pageRef = useRef(1);
  const genRef = useRef(0);
  const loadingRef = useRef(false); // guards against overlapping loads

  const loadFirst = useCallback(
    async (mode: 'initial' | 'refresh') => {
      const gen = ++genRef.current;
      loadingRef.current = true;
      if (mode === 'initial') setStatus('loading');
      else setRefreshing(true);
      setLoadingMore(false);
      setError(null);

      try {
        const res = await getFeed({ page: 1, limit: LIMIT, username });
        if (gen !== genRef.current) return; // superseded
        setPosts(res.data);
        pageRef.current = res.page;
        setHasMore(res.hasMore);
        setStatus('success');
      } catch (e) {
        if (gen !== genRef.current) return;
        setError(e instanceof ApiError ? e.message : 'Could not load the feed.');
        setStatus('error');
      } finally {
        if (gen === genRef.current) {
          loadingRef.current = false;
          setRefreshing(false);
        }
      }
    },
    [username],
  );

  useEffect(() => {
    void loadFirst('initial');
  }, [loadFirst]);

  const refresh = useCallback(() => {
    void loadFirst('refresh');
  }, [loadFirst]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || status !== 'success') return;
    const gen = genRef.current;
    loadingRef.current = true;
    setLoadingMore(true);

    try {
      const res = await getFeed({ page: pageRef.current + 1, limit: LIMIT, username });
      if (gen !== genRef.current) return; // filter changed mid-flight
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...res.data.filter((p) => !seen.has(p.id))];
      });
      pageRef.current = res.page;
      setHasMore(res.hasMore);
    } catch {
      // Keep what we have; a later scroll can retry.
    } finally {
      if (gen === genRef.current) {
        loadingRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [hasMore, status, username]);

  const updatePost = useCallback((id: string, patch: Partial<Post>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const prependPost = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  return {
    posts,
    status,
    error,
    refreshing,
    loadingMore,
    hasMore,
    refresh,
    loadMore,
    updatePost,
    prependPost,
  };
}
