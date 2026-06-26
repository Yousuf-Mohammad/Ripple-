import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useFeed, type UseFeedResult } from '../hooks/useFeed';

export interface FeedContextValue extends UseFeedResult {
  /** Raw filter input (bound to the UsernameFilter). */
  filterText: string;
  setFilterText: (text: string) => void;
  /** Debounced, trimmed username the feed is currently loaded for. */
  debouncedUsername: string;
}

const FeedContext = createContext<FeedContextValue | undefined>(undefined);

/**
 * Holds the single feed state shared by FeedScreen and CreatePostScreen so a
 * newly created post can be prepended without a refetch, and (P9) like toggles
 * can patch a post in place from anywhere in the App stack.
 */
export function FeedProvider({ children }: { children: ReactNode }) {
  const [filterText, setFilterText] = useState('');
  const debouncedUsername = useDebouncedValue(filterText.trim(), 400);
  const feed = useFeed(debouncedUsername);

  const value = useMemo<FeedContextValue>(
    () => ({ ...feed, filterText, setFilterText, debouncedUsername }),
    [feed, filterText, debouncedUsername],
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeedContext(): FeedContextValue {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error('useFeedContext must be used within a FeedProvider');
  return ctx;
}
