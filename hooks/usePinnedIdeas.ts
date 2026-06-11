'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Idea } from '@/types';
import { getPinnedIdeas, reorderPinnedIdeas as reorderPinsDB } from '@/lib/firebase/firestore';
import { useAuth } from './useAuth';

export function usePinnedIdeas() {
  const { user } = useAuth();
  const [pinnedIdeas, setPinnedIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPinned = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getPinnedIdeas(user.uid);
      setPinnedIdeas(data);
    } catch (err) {
      console.error('載入釘選靈感失敗:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPinned();
  }, [loadPinned]);

  const reorderPins = useCallback(
    async (orderedIds: string[]) => {
      if (!user) return;
      // Optimistic update
      const reordered = orderedIds
        .map((id) => pinnedIdeas.find((p) => p.id === id))
        .filter(Boolean) as Idea[];
      setPinnedIdeas(reordered);
      await reorderPinsDB(user.uid, orderedIds);
    },
    [user, pinnedIdeas],
  );

  return {
    pinnedIdeas,
    loading,
    loadPinned,
    reorderPins,
  };
}
