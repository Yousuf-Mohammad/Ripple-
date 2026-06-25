import type { Notification } from 'firebase-admin/messaging';
import type { IPost } from '../models/Post';
import { User } from '../models/User';
import { getMessaging } from '../config/firebase';

/**
 * Notification service.
 *
 * Sends an FCM push to a post's author when someone else likes or comments.
 * Controllers call these fire-and-forget, so they must NEVER throw — every send
 * is wrapped in try/catch (§9). When FCM is disabled (no credentials) they no-op.
 */

const FCM_DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

/** Notify a post's author that `actorId` liked their post. Skips self (§4.3). */
export async function notifyOnLike(post: IPost, actorId: string): Promise<void> {
  if (post.author.equals(actorId)) return;
  const actor = await actorUsername(actorId);
  if (!actor) return;
  await sendToAuthor(
    post,
    { title: 'New like', body: `@${actor} liked your post` },
    { type: 'like', postId: String(post.id) },
  );
}

/** Notify a post's author that `actorId` commented. Skips self (§4.3). */
export async function notifyOnComment(post: IPost, actorId: string, text: string): Promise<void> {
  if (post.author.equals(actorId)) return;
  const actor = await actorUsername(actorId);
  if (!actor) return;
  await sendToAuthor(
    post,
    { title: 'New comment', body: `@${actor}: ${text.slice(0, 60)}` },
    { type: 'comment', postId: String(post.id) },
  );
}

async function actorUsername(actorId: string): Promise<string | null> {
  const actor = await User.findById(actorId).select('username');
  return actor?.username ?? null;
}

/**
 * Multicast `notification` + `data` to all of the author's device tokens and
 * prune any that FCM reports as unregistered/invalid (§4.2). Never throws.
 */
async function sendToAuthor(
  post: IPost,
  notification: Notification,
  data: Record<string, string>,
): Promise<void> {
  const messaging = getMessaging();
  if (!messaging) return; // FCM disabled (no credentials)

  try {
    const author = await User.findById(post.author).select('fcmTokens');
    const tokens = author?.fcmTokens ?? [];
    if (tokens.length === 0) return;

    const result = await messaging.sendEachForMulticast({ tokens, notification, data });

    const dead = result.responses
      .map((r, i) => (!r.success && FCM_DEAD_TOKEN_CODES.has(r.error?.code ?? '') ? tokens[i] : null))
      .filter((t): t is string => t !== null);

    if (dead.length > 0) {
      await User.updateOne({ _id: post.author }, { $pull: { fcmTokens: { $in: dead } } });
    }
  } catch (err) {
    // A notification failure must never break the like/comment request (§9).
    console.error('[notification] send failed:', err);
  }
}
