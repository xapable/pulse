'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { generateIdeas } from '@/lib/ai/client';
import type {
  Tone,
  ContentLength,
  PostAngle,
  GenerationCount,
  GenerationOptions,
} from '@/types';
import {
  TONE_OPTIONS,
  LENGTH_OPTIONS,
  LENGTH_LABELS,
  ANGLE_OPTIONS,
  COUNT_OPTIONS,
} from '@/types';
import { Loader2, Sparkles, ChevronDown, FileText, PencilLine } from 'lucide-react';

interface IdeaInputProps {
  onIdeasGenerated: (ideas: { title: string; description: string }[]) => void;
  onSourceTextChange: (text: string) => void;
  onOptionsChange: (options: GenerationOptions) => void;
  basePrompt: string;
}

export default function IdeaInput({
  onIdeasGenerated,
  onSourceTextChange,
  onOptionsChange,
  basePrompt,
}: IdeaInputProps) {
  const { user } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [tone, setTone] = useState<Tone>('專業');
  const [length, setLength] = useState<ContentLength>('中');
  const [angle, setAngle] = useState<PostAngle>('教育');
  const [count, setCount] = useState<GenerationCount>(3);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Build full prompt: basePrompt + optional user extra input
  const buildFullPrompt = (): string => {
    if (!userInput.trim()) return basePrompt;
    return `${basePrompt}\n\n補充資料：${userInput.trim()}`;
  };

  // Notify parent of source text changes
  useEffect(() => {
    onSourceTextChange(buildFullPrompt());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePrompt, userInput]);

  const updateOptions = (
    newTone: Tone,
    newLength: ContentLength,
    newAngle: PostAngle,
    newCount: GenerationCount,
  ) => {
    onOptionsChange({ tone: newTone, length: newLength, angle: newAngle, count: newCount });
  };

  const handleGenerate = async () => {
    const fullPrompt = buildFullPrompt();
    if (!fullPrompt.trim()) {
      setError('請先建立專案再生成靈感');
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      const apiKey = localStorage.getItem('pulse_api_key');
      const provider = (localStorage.getItem('pulse_provider') || 'OpenAI') as any;
      const model = localStorage.getItem('pulse_model') || 'gpt-4o';

      if (!apiKey) {
        setError('請先到設定頁面設定 API Key');
        setGenerating(false);
        return;
      }

      const ideas = await generateIdeas(provider, model, apiKey, fullPrompt, {
        tone,
        length,
        angle,
        count,
      });
      onIdeasGenerated(ideas);
    } catch (err: any) {
      setError(err.message || '生成失敗，請重試');
    } finally {
      setGenerating(false);
    }
  };

  const focusInput = () => {
    textareaRef.current?.focus();
  };

  // Expose focusInput for parent
  (IdeaInput as any).focusInput = focusInput;

  const selectClasses = (isOpen: boolean) =>
    `px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer whitespace-nowrap ${
      isOpen
        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500'
    }`;

  return (
    <div className="space-y-5">
      {/* Base Prompt (Read-only) */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <FileText size={14} className="text-zinc-400" />
          <span className="text-xs font-medium text-zinc-500">公司資料（自動生成）</span>
        </div>
        <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 px-4 py-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap leading-relaxed">
            {basePrompt || '尚未選擇專案'}
          </p>
        </div>
      </div>

      {/* User Extra Input */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <PencilLine size={14} className="text-zinc-400" />
          <span className="text-xs font-medium text-zinc-500">補充更多資料（可選）</span>
        </div>
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="例如：今個月聖誕節促銷、主打環保材質、目標客群係年輕人..."
          rows={3}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 resize-none"
        />
      </div>

      {/* Generation Options */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-400 mr-1">語氣</span>
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'tone' ? null : 'tone')}
            className={selectClasses(openDropdown === 'tone')}
          >
            {tone} <ChevronDown size={12} className="inline ml-1" />
          </button>
          {openDropdown === 'tone' && (
            <div className="absolute top-full mt-1 left-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-1 z-20 min-w-[120px]">
              {TONE_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTone(t);
                    setOpenDropdown(null);
                    updateOptions(t, length, angle, count);
                  }}
                  className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    tone === t
                      ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs text-zinc-400 mr-1 ml-2">長度</span>
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'length' ? null : 'length')}
            className={selectClasses(openDropdown === 'length')}
          >
            {length} <ChevronDown size={12} className="inline ml-1" />
          </button>
          {openDropdown === 'length' && (
            <div className="absolute top-full mt-1 left-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-1 z-20 min-w-[140px]">
              {LENGTH_OPTIONS.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLength(l);
                    setOpenDropdown(null);
                    updateOptions(tone, l, angle, count);
                  }}
                  className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    length === l
                      ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {LENGTH_LABELS[l]}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs text-zinc-400 mr-1 ml-2">角度</span>
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'angle' ? null : 'angle')}
            className={selectClasses(openDropdown === 'angle')}
          >
            {angle} <ChevronDown size={12} className="inline ml-1" />
          </button>
          {openDropdown === 'angle' && (
            <div className="absolute top-full mt-1 left-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-1 z-20 min-w-[120px]">
              {ANGLE_OPTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setAngle(a);
                    setOpenDropdown(null);
                    updateOptions(tone, length, a, count);
                  }}
                  className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    angle === a
                      ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs text-zinc-400 mr-1 ml-2">數量</span>
        <div className="flex gap-1">
          {COUNT_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCount(c);
                updateOptions(tone, length, angle, c);
              }}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                count === c
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              生成靈感
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
