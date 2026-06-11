'use client';

import { useState, useCallback, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import NewProjectModal from '@/components/NewProjectModal';
import type { Project, ViewMode } from '@/types';
import { useProjects } from '@/hooks/useProjects';

export default function HomePage() {
  const { projects, loading: projectsLoading, addProject, editProject, removeProject } = useProjects();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('generate');
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Auto-select first project or show modal if no projects
  useEffect(() => {
    if (projectsLoading) return;
    if (projects.length === 0) {
      setShowNewModal(true);
      setCurrentProjectId(null);
    } else if (!currentProjectId || !projects.find((p) => p.id === currentProjectId)) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects, projectsLoading, currentProjectId]);

  const currentProject = projects.find((p) => p.id === currentProjectId) ?? null;

  const handleNewProject = useCallback(() => {
    setEditingProject(null);
    setShowNewModal(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setEditingProject(project);
    setShowNewModal(true);
  }, []);

  const handleDeleteProject = useCallback(
    async (project: Project) => {
      if (!confirm(`確定要刪除「${project.companyName}」？所有相關靈感都會一併刪除。`)) return;
      await removeProject(project.id);
      if (currentProjectId === project.id) {
        setCurrentProjectId(null);
      }
    },
    [removeProject, currentProjectId],
  );

  const handleProjectSubmit = useCallback(
    async (data: {
      companyName: string;
      companyUrl?: string;
      companyDescription?: string;
      industry?: string;
      products?: string;
      brandTone?: string;
      targetAudience?: string;
      uniqueSellingPoint?: string;
    }) => {
      if (editingProject) {
        await editProject(editingProject.id, data);
        return editingProject.id;
      } else {
        const newId = await addProject(data);
        if (newId) setCurrentProjectId(newId);
        return newId;
      }
    },
    [editingProject, editProject, addProject],
  );

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((c) => !c)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={(p) => setCurrentProjectId(p.id)}
          onNewProject={handleNewProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
        />
        <MainContent
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          currentProject={currentProject}
        />

        {/* New/Edit Project Modal */}
        <NewProjectModal
          open={showNewModal}
          onClose={() => {
            setShowNewModal(false);
            setEditingProject(null);
          }}
          onSubmit={handleProjectSubmit}
          title={editingProject ? '編輯專案' : '新增專案'}
          initialData={
            editingProject
              ? {
                  companyName: editingProject.companyName,
                  companyUrl: editingProject.companyUrl,
                  companyDescription: editingProject.companyDescription,
                  industry: editingProject.industry,
                  products: editingProject.products,
                  brandTone: editingProject.brandTone,
                  targetAudience: editingProject.targetAudience,
                  uniqueSellingPoint: editingProject.uniqueSellingPoint,
                }
              : undefined
          }
        />
      </div>
    </AuthGuard>
  );
}
