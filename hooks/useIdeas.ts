'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Idea, Tone, ContentLength, PostAngle } from '@/types';
import {
  createIdea,
  updateIdea,
  deleteIdea as deleteIdeaDB,
  getProjectIdeas,
} from '@/lib/firebase/firestore';
import { useAuth } from './useAuth';

export function useIdeas(projectId: string | null) {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);

  const loadIdeas = useCallback(async () => {
    if (!user || !projectId) {
      setIdeas([]);
      return;
    }
    setLoading(true);
    try {
      const data = await getProjectIdeas(projectId);
      setIdeas(data);
    } catch (err) {
      console.error('載入靈感失敗:', err);
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const saveIdea = useCallback(
    async (idea: {
      title: string;
      description: string;
      sourceText: string;
      tone: Tone;
      length: ContentLength;
      angle: PostAngle;
    }) => {
      if (!user || !projectId) return;
      const id = await createIdea({
        userId: user.uid,
        projectId,
        title: idea.title,
        description: idea.description,
        type: 'ig_post',
        status: 'saved',
        isPinned: false,
        sourceText: idea.sourceText,
        tone: idea.tone,
        length: idea.length,
        angle: idea.angle,
      });
      await loadIdeas();
      return id;
    },
    [user, projectId, loadIdeas],
  );

  const togglePin = useCallback(
    async (idea: Idea) => {
      await updateIdea(idea.id, { isPinned: !idea.isPinned });
      await loadIdeas();
    },
    [loadIdeas],
  );

  const markUsed = useCallback(
    async (idea: Idea) => {
      await updateIdea(idea.id, { status: 'used' });
      await loadIdeas();
    },
    [loadIdeas],
  );

  const removeIdea = useCallback(
    async (id: string) => {
      await deleteIdeaDB(id);
      await loadIdeas();
    },
    [loadIdeas],
  );

  return {
    ideas,
    loading,
    loadIdeas,
    saveIdea,
    togglePin,
    markUsed,
    removeIdea,
  };
}
