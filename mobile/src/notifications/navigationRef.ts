import { createNavigationContainerRef } from '@react-navigation/native';
import type { AppStackParamList } from '../navigation/types';

/**
 * Container-level navigation ref so notification handlers (which fire outside
 * the React tree / before screens mount) can deep-link.
 */
export const navigationRef = createNavigationContainerRef<AppStackParamList>();

/** Open the Comments modal for a post. No-ops until navigation is ready / authed. */
export function navigateToPost(postId?: string | null): void {
  if (!postId || !navigationRef.isReady()) return;
  navigationRef.navigate('Comments', { postId });
}
