import { useCallback, useRef } from 'react';
import { toggleLike as toggleLikeApi } from '../api/posts.api';
import type { Post } from '../api/types';
import { useFeedContext } from '../feed/FeedContext';

/**
 * Optimistic like toggle: flips the post in the feed immediately, reconciles
 * with the server's `{ liked, likeCount }`, and rolls back on error. A per-post
 * in-flight guard prevents a rapid double-tap from desyncing the count.
 */
export function useToggleLike(): (post: Post) => Promise<void> {
  const { updatePost } = useFeedContext();
  const inFlight = useRef<Set<string>>(new Set());

  return useCallback(
    async (post: Post) => {
      if (inFlight.current.has(post.id)) return;
      inFlight.current.add(post.id);

      const prev = { likedByMe: post.likedByMe, likeCount: post.likeCount };
      // Optimistic update.
      updatePost(post.id, {
        likedByMe: !prev.likedByMe,
        likeCount: prev.likeCount + (prev.likedByMe ? -1 : 1),
      });

      try {
        const res = await toggleLikeApi(post.id);
        updatePost(post.id, { likedByMe: res.liked, likeCount: res.likeCount });
      } catch {
        updatePost(post.id, prev); // rollback
      } finally {
        inFlight.current.delete(post.id);
      }
    },
    [updatePost],
  );
}
