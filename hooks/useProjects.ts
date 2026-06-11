'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Project } from '@/types';
import {
  createProject as createProjectDB,
  getProjects,
  updateProject as updateProjectDB,
  deleteProject as deleteProjectDB,
  togglePinProject,
} from '@/lib/firebase/firestore';
import { useAuth } from './useAuth';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getProjects(user.uid);
      setProjects(data);
    } catch (err) {
      console.error('載入專案失敗:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const addProject = useCallback(
    async (data: { companyName: string; companyUrl?: string; companyDescription?: string }) => {
      if (!user) return null;
      const id = await createProjectDB({
        userId: user.uid,
        ...data,
      });
      await loadProjects();
      return id;
    },
    [user, loadProjects],
  );

  const editProject = useCallback(
    async (id: string, updates: { companyName?: string; companyUrl?: string; companyDescription?: string }) => {
      await updateProjectDB(id, updates);
      await loadProjects();
    },
    [loadProjects],
  );

  const removeProject = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteProjectDB(id, user.uid);
      await loadProjects();
    },
    [user, loadProjects],
  );

  const togglePin = useCallback(
    async (id: string, isPinned: boolean) => {
      await togglePinProject(id, isPinned);
      await loadProjects();
    },
    [loadProjects],
  );

  return {
    projects,
    loading,
    loadProjects,
    addProject,
    editProject,
    removeProject,
    togglePin,
  };
}
