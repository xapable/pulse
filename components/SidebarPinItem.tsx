'use client';

import { Pin, X } from 'lucide-react';
import type { Idea } from '@/types';

interface SidebarPinItemProps {
  idea: Idea;
  collapsed: boolean;
  onSelect: (idea: Idea) => void;
  onUnpin: (idea: Idea) => void;
}

export default function SidebarPinItem({ idea, collapsed, onSelect, onUnpin }: SidebarPinItemProps) {
  return (
    <div
      onClick={() => onSelect(idea)}
      className="group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer mb-0.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      title={collapsed ? idea.title : undefined}
    >
      <Pin size={12} className="text-amber-500 shrink-0" />
      {!collapsed && (
        <>
          <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate flex-1">
            {idea.title}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnpin(idea);
            }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-all"
            title="取消釘選"
          >
            <X size={12} />
          </button>
        </>
      )}
    </div>
  );
}
