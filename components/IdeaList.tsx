'use client';

import IdeaCard from './IdeaCard';
import type { GenerationOptions } from '@/types';

interface IdeaListProps {
  ideas: { title: string; description: string }[];
  options: GenerationOptions;
  sourceText: string;
  savedIds: Set<string>;
  pinnedIds: Set<string>;
  onSave: (idea: { title: string; description: string }, index: number) => Promise<void>;
  onPin: (idea: { title: string; description: string }, index: number) => void;
}

export default function IdeaList({
  ideas,
  options,
  sourceText,
  savedIds,
  pinnedIds,
  onSave,
  onPin,
}: IdeaListProps) {
  if (ideas.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
        生成結果（{ideas.length} 個靈感）
      </h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ideas.map((idea, idx) => {
          const key = `${idea.title}-${idx}`;
          return (
            <IdeaCard
              key={key}
              title={idea.title}
              description={idea.description}
              tone={options.tone}
              length={options.length}
              angle={options.angle}
              isSaved={savedIds.has(key)}
              isPinned={pinnedIds.has(key)}
              onSave={
                savedIds.has(key)
                  ? undefined
                  : async () => onSave(idea, idx)
              }
              onPin={
                pinnedIds.has(key)
                  ? undefined
                  : () => onPin(idea, idx)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
