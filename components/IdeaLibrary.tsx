'use client';

import { useState } from 'react';
import type { Idea, IdeaFilter } from '@/types';
import IdeaCard from './IdeaCard';

interface IdeaLibraryProps {
  ideas: Idea[];
  loading: boolean;
  onTogglePin: (idea: Idea) => void;
  onMarkUsed: (idea: Idea) => void;
  onDelete: (id: string) => void;
}

const FILTERS: IdeaFilter[] = ['全部', '未使用', '已使用', '已釘選'];

export default function IdeaLibrary({
  ideas,
  loading,
  onTogglePin,
  onMarkUsed,
  onDelete,
}: IdeaLibraryProps) {
  const [filter, setFilter] = useState<IdeaFilter>('全部');

  const filtered = ideas.filter((idea) => {
    switch (filter) {
      case '未使用':
        return idea.status === 'saved' && !idea.isPinned;
      case '已使用':
        return idea.status === 'used';
      case '已釘選':
        return idea.isPinned;
      default:
        return true;
    }
  });

  return (
    <div className="space-y-5">
      {/* Header + Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">我的靈感庫</h2>
        <span className="text-sm text-zinc-400">({ideas.length} 個靈感)</span>
        <div className="flex gap-1 ml-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === f
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20 text-zinc-400">
          <div className="inline-block h-6 w-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
          <p className="mt-3 text-sm">載入中...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-400 text-sm">
            {filter === '全部'
              ? '尚未儲存任何靈感，生成靈感後點擊 💾 儲存即可加入靈感庫'
              : `冇${filter === '未使用' ? '' : filter}嘅靈感`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((idea) => (
            <IdeaCard
              key={idea.id}
              title={idea.title}
              description={idea.description}
              tone={idea.tone}
              length={idea.length}
              angle={idea.angle}
              isPinned={idea.isPinned}
              isUsed={idea.status === 'used'}
              showLibraryActions
              onPin={() => onTogglePin(idea)}
              onUnpin={() => onTogglePin(idea)}
              onMarkUsed={idea.status !== 'used' ? () => onMarkUsed(idea) : undefined}
              onDelete={() => onDelete(idea.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
