'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import type { Project, GenerationOptions, ViewMode, PostType } from '@/types';
import { useIdeas } from '@/hooks/useIdeas';
import IdeaInput from './IdeaInput';
import IdeaList from './IdeaList';
import IdeaLibrary from './IdeaLibrary';
import { Building2, Globe, FileText } from 'lucide-react';

// ── Build base prompt from project data ──
function buildBasePrompt(project: Project | null): string {
  if (!project) return '';
  const lines: string[] = [];
  lines.push(`公司名稱：${project.companyName}`);
  if (project.companyUrl) lines.push(`公司網址：${project.companyUrl}`);
  if (project.companyDescription) lines.push(`公司描述：${project.companyDescription}`);
  if (project.industry) lines.push(`行業：${project.industry}`);
  if (project.products) lines.push(`產品/服務：${project.products}`);
  if (project.brandTone) lines.push(`品牌語氣：${project.brandTone}`);
  if (project.targetAudience) lines.push(`目標客群：${project.targetAudience}`);
  if (project.uniqueSellingPoint) lines.push(`獨特賣點：${project.uniqueSellingPoint}`);
  return lines.join('\n');
}

interface MainContentProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  currentProject: Project | null;
}

export default function MainContent({
  viewMode,
  onViewModeChange,
  currentProject,
}: MainContentProps) {
  const { ideas, loading, loadIdeas, saveIdea, togglePin, markUsed, removeIdea } =
    useIdeas(currentProject?.id ?? null);

  const [generatedIdeas, setGeneratedIdeas] = useState<
    { title: string; description: string }[]
  >([]);
  const [sourceText, setSourceText] = useState('');
  const [options, setOptions] = useState<GenerationOptions>({
    tone: '專業',
    length: '中',
    angle: '教育',
    count: 3,
  });
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [postType, setPostType] = useState<PostType>('ig_post');
  const inputRef = useRef<{ focusInput: () => void }>(null);

  const handleIdeasGenerated = useCallback(
    (newIdeas: { title: string; description: string }[]) => {
      setGeneratedIdeas(newIdeas);
      setSavedIds(new Set());
      setPinnedIds(new Set());
    },
    [],
  );

  const handleSave = useCallback(
    async (idea: { title: string; description: string }, index: number) => {
      if (!currentProject) return;
      const key = `${idea.title}-${index}`;
      await saveIdea({
        title: idea.title,
        description: idea.description,
        sourceText,
        tone: options.tone,
        length: options.length,
        angle: options.angle,
        type: postType,
      });
      setSavedIds((prev) => new Set(prev).add(key));
    },
    [saveIdea, sourceText, options, currentProject, postType],
  );

  const handlePin = useCallback(
    async (idea: { title: string; description: string }, index: number) => {
      if (!currentProject) return;
      const key = `${idea.title}-${index}`;
      const id = await saveIdea({
        title: idea.title,
        description: idea.description,
        sourceText,
        tone: options.tone,
        length: options.length,
        angle: options.angle,
        type: postType,
      });
      if (id) {
        const { updateIdea } = await import('@/lib/firebase/firestore');
        await updateIdea(id, { isPinned: true });
        setPinnedIds((prev) => new Set(prev).add(key));
        setSavedIds((prev) => new Set(prev).add(key));
        loadIdeas();
      }
    },
    [saveIdea, sourceText, options, currentProject, loadIdeas, postType],
  );

  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focusInput?.();
    }, 100);
  }, []);

  const basePrompt = useMemo(() => buildBasePrompt(currentProject), [currentProject]);

  return (
    <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-zinc-500" />
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {currentProject
                  ? currentProject.companyName
                  : viewMode === 'library'
                    ? '我的靈感庫'
                    : '選擇或建立專案'}
              </h2>
            </div>
            {viewMode === 'library' && (
              <button
                onClick={() => onViewModeChange('generate')}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 ml-auto"
              >
                ← 返回生成
              </button>
            )}
            {currentProject && (
              <div className="flex items-center gap-3 ml-auto text-xs text-zinc-400">
                {currentProject.companyUrl && (
                  <span className="flex items-center gap-1">
                    <Globe size={12} />
                    {currentProject.companyUrl}
                  </span>
                )}
              </div>
            )}
          </div>
          {currentProject?.companyDescription && viewMode === 'generate' && (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
              <FileText size={14} className="shrink-0 mt-0.5" />
              {currentProject.companyDescription}
            </p>
          )}
        </div>

        {/* No Project Selected */}
        {!currentProject && viewMode === 'generate' && (
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-400 text-sm">
              請喺左側邊欄選擇或建立一個專案開始生成靈感
            </p>
          </div>
        )}

        {/* Content */}
        {currentProject && (
          <>
            {viewMode === 'library' ? (
              <IdeaLibrary
                ideas={ideas}
                loading={loading}
                onTogglePin={togglePin}
                onMarkUsed={markUsed}
                onDelete={removeIdea}
              />
            ) : (
              <div className="space-y-8">
                {/* Input Section */}
                <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
                  <IdeaInput
                    onIdeasGenerated={handleIdeasGenerated}
                    onSourceTextChange={setSourceText}
                    onOptionsChange={setOptions}
                    onPostTypeChange={setPostType}
                    basePrompt={basePrompt}
                  />
                </div>

                {/* Generated Ideas */}
                {generatedIdeas.length > 0 && (
                  <IdeaList
                    ideas={generatedIdeas}
                    options={options}
                    sourceText={sourceText}
                    postType={postType}
                    savedIds={savedIds}
                    pinnedIds={pinnedIds}
                    onSave={handleSave}
                    onPin={handlePin}
                  />
                )}

                {/* Empty State */}
                {generatedIdeas.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-zinc-400 text-sm">
                      輸入更多關於「{currentProject.companyName}」嘅資料，然後點擊「生成靈感」開始
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
