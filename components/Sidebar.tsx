'use client';

import { useState } from 'react';
import type { Project, ViewMode } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/firebase/auth';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Library,
  LogOut,
  Settings,
  User,
  MoreHorizontal,
  Pencil,
  Trash2,
  Building2,
  Sparkles,
  Pin,
  PinOff,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  projects: Project[];
  currentProjectId: string | null;
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
}

export default function Sidebar({
  collapsed,
  onToggle,
  viewMode,
  onViewModeChange,
  projects,
  currentProjectId,
  onSelectProject,
  onNewProject,
  onEditProject,
  onDeleteProject,
  onTogglePin,
}: SidebarProps) {
  const { profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside
      className={`flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } h-full flex-shrink-0`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        {!collapsed && (
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
            Pulse
            <span className="text-xs font-normal text-zinc-400 ml-1">by Xapto Studio</span>
          </h1>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 shrink-0"
          title={collapsed ? '展開側邊欄' : '收合側邊欄'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* New Project Button */}
      <div className="p-3">
        <button
          onClick={onNewProject}
          className={`flex items-center gap-2 w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity ${
            collapsed ? 'justify-center px-2' : ''
          }`}
          title={collapsed ? '新專案' : undefined}
        >
          <Plus size={18} />
          {!collapsed && <span>新專案</span>}
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-3">
        {!collapsed && (
          <div className="mb-2 px-1">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              專案列表
            </span>
          </div>
        )}

        {projects.length === 0 && !collapsed && (
          <p className="text-xs text-zinc-400 px-1 mb-3">
            尚未建立任何專案，點擊「新專案」開始
          </p>
        )}

        {/* Sort: pinned first */}
        {[...projects]
          .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
          })
          .map((project) => (
          <div
            key={project.id}
            className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer mb-0.5 transition-colors relative ${
              currentProjectId === project.id
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <button
              onClick={() => {
                onSelectProject(project);
                onViewModeChange('generate');
              }}
              className="flex items-center gap-2 flex-1 min-w-0 text-left"
              title={collapsed ? project.companyName : undefined}
            >
              {project.isPinned && !collapsed && (
                <Pin size={12} className="shrink-0 text-amber-500" />
              )}
              <Building2 size={16} className="shrink-0" />
              {!collapsed && (
                <span className="text-sm truncate">{project.companyName}</span>
              )}
            </button>

            {!collapsed && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === project.id ? null : project.id);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-all"
                >
                  <MoreHorizontal size={14} />
                </button>

                {menuOpen === project.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(null)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-1 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          onTogglePin(project.id, !project.isPinned);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                      >
                        {project.isPinned ? (
                          <><PinOff size={14} />取消釘選</>
                        ) : (
                          <><Pin size={14} />釘選</>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          onEditProject(project);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                      >
                        <Pencil size={14} />
                        編輯
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(null);
                          onDeleteProject(project);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                      >
                        <Trash2 size={14} />
                        刪除
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Divider */}
        <div className="my-3 border-t border-zinc-200 dark:border-zinc-800" />

        {/* My Library */}
        <button
          onClick={() => onViewModeChange('library')}
          className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm transition-colors mb-1 ${
            viewMode === 'library'
              ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
          } ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? '我的靈感庫' : undefined}
        >
          <Library size={18} />
          {!collapsed && <span>我的靈感庫</span>}
        </button>
      </div>

      {/* Bottom: User Info + Settings */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-3">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt=""
                  className="w-8 h-8 rounded-full shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                  <User size={16} className="text-zinc-500" />
                </div>
              )}
              <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                {profile?.displayName ?? '用戶'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <a
                href="/settings/api"
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                title="設定"
              >
                <Settings size={16} />
              </a>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                title="登出"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {profile?.photoURL ? (
              <img
                src={profile.photoURL}
                alt=""
                className="w-8 h-8 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                <User size={16} className="text-zinc-500" />
              </div>
            )}
            <a
              href="/settings/api"
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              title="設定"
            >
              <Settings size={16} />
            </a>
            <button
              onClick={handleSignOut}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              title="登出"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
