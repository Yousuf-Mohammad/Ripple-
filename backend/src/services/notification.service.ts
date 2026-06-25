import type { IPost } from '../models/Post';

/**
 * Notification service.
 *
 * P3: these are intentionally no-op stubs so controllers can wire the calls now.
 * P4 fills the bodies: load the post author's `fcmTokens`, build an FCM multicast
 * message, send via `admin.messaging().sendEachForMulticast`, and prune
 * unregistered tokens. The self-skip (`post.author === actorId`, §4.3) and the
 * try/catch that prevents a send failure from breaking the request (§9) also
 * live here. These functions must NEVER throw — controllers call them
 * fire-and-forget.
 */

/** Notify a post's author that `actorId` liked their post. Skips self. */
export async function notifyOnLike(post: IPost, actorId: string): Promise<void> {
  if (post.author.equals(actorId)) return; // never notify yourself (§4.3)
  // P4: send FCM "New like" notification to post author.
}

/** Notify a post's author that `actorId` commented. Skips self. */
export async function notifyOnComment(
  post: IPost,
  actorId: string,
  _text: string,
): Promise<void> {
  if (post.author.equals(actorId)) return; // never notify yourself (§4.3)
  // P4: send FCM "New comment" notification to post author.
}
