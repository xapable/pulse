'use client';

import { useState } from 'react';
import { Save, Pin, Copy, Check, PinOff } from 'lucide-react';
import type { Idea, Tone, ContentLength, PostAngle } from '@/types';
import { LENGTH_LABELS } from '@/types';

interface IdeaCardProps {
  title: string;
  description: string;
  tone?: Tone;
  length?: ContentLength;
  angle?: PostAngle;
  isPinned?: boolean;
  isUsed?: boolean;
  isSaved?: boolean;
  onSave?: () => Promise<void>;
  onPin?: () => void;
  onUnpin?: () => void;
  onMarkUsed?: () => void;
  onDelete?: () => void;
  showLibraryActions?: boolean;
}

export default function IdeaCard({
  title,
  description,
  tone,
  length,
  angle,
  isPinned = false,
  isUsed = false,
  isSaved = false,
  onSave,
  onPin,
  onUnpin,
  onMarkUsed,
  onDelete,
  showLibraryActions = false,
}: IdeaCardProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${title}\n\n${description}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!onSave || saving) return;
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 space-y-3 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all">
      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {tone && (
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            {tone}
          </span>
        )}
        {length && (
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            {LENGTH_LABELS[length]}
          </span>
        )}
        {angle && (
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            {angle}
          </span>
        )}
        {isUsed && (
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            已使用
          </span>
        )}
        {isPinned && (
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            📌 已釘選
          </span>
        )}
        {isSaved && (
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            已儲存
          </span>
        )}
      </div>

      {/* Content */}
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base leading-snug">
        {title}
      </h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
        {description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1 pt-1 border-t border-zinc-100 dark:border-zinc-800">
        {!showLibraryActions && onSave && !isSaved && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            title="儲存到靈感庫"
          >
            <Save size={14} />
            {saving ? '儲存中...' : '儲存'}
          </button>
        )}

        {onPin && !isPinned && (
          <button
            onClick={onPin}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="釘選"
          >
            <Pin size={14} />
            釘選
          </button>
        )}

        {onUnpin && isPinned && (
          <button
            onClick={onUnpin}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            title="取消釘選"
          >
            <PinOff size={14} />
            取消釘選
          </button>
        )}

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="複製"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? '已複製' : '複製'}
        </button>

        {showLibraryActions && (
          <>
            {onMarkUsed && !isUsed && (
              <button
                onClick={onMarkUsed}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-zinc-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-colors"
                title="標記為已使用"
              >
                <Check size={14} />
                標記已使用
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors ml-auto"
                title="刪除"
              >
                🗑️ 刪除
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
