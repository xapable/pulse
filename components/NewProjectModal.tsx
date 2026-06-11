'use client';

import { useState } from 'react';
import {
  X, Building2, Globe, FileText, Loader2, Sparkles,
  Briefcase, ShoppingBag, Eye, Users, Star,
} from 'lucide-react';

interface ProjectFormData {
  companyName: string;
  companyUrl?: string;
  companyDescription?: string;
  industry?: string;
  products?: string;
  brandTone?: string;
  targetAudience?: string;
  uniqueSellingPoint?: string;
}

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<string | null>;
  title?: string;
  initialData?: ProjectFormData;
}

export default function NewProjectModal({
  open,
  onClose,
  onSubmit,
  title = '新增專案',
  initialData,
}: NewProjectModalProps) {
  const [companyName, setCompanyName] = useState(initialData?.companyName ?? '');
  const [companyUrl, setCompanyUrl] = useState(initialData?.companyUrl ?? '');
  const [companyDescription, setCompanyDescription] = useState(initialData?.companyDescription ?? '');
  const [industry, setIndustry] = useState(initialData?.industry ?? '');
  const [products, setProducts] = useState(initialData?.products ?? '');
  const [brandTone, setBrandTone] = useState(initialData?.brandTone ?? '');
  const [targetAudience, setTargetAudience] = useState(initialData?.targetAudience ?? '');
  const [uniqueSellingPoint, setUniqueSellingPoint] = useState(initialData?.uniqueSellingPoint ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ── Analyze website states ──
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  if (!open) return null;

  // ── Safe trim (AI may return array) ──
  const str = (val: unknown): string => {
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.filter(Boolean).join('、');
    return '';
  };

  const handleAnalyze = async () => {
    if (!companyUrl.trim()) {
      setAnalyzeError('請先輸入公司網址');
      return;
    }

    const apiKey = localStorage.getItem('pulse_api_key');
    if (!apiKey) {
      setAnalyzeError('請先到設定頁面設定 API Key');
      return;
    }

    setAnalyzeError(null);
    setSuccessMsg(null);
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: companyUrl.trim(), apiKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '分析失敗');
      }

      // Auto-fill fields
      if (data.companyDescription) setCompanyDescription(data.companyDescription);
      if (data.industry) setIndustry(data.industry);
      if (data.products) setProducts(data.products);
      if (data.brandTone) setBrandTone(data.brandTone);
      if (data.targetAudience) setTargetAudience(data.targetAudience);
      if (data.uniqueSellingPoint) setUniqueSellingPoint(data.uniqueSellingPoint);

      setSuccessMsg('✅ 已自動填寫公司資料，請確認或修改');
    } catch (err: any) {
      setAnalyzeError(err.message || '分析失敗，請手動填寫或檢查 API Key');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      setError('請輸入公司名稱');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        companyName: str(companyName).trim(),
        companyUrl: str(companyUrl).trim() || undefined,
        companyDescription: str(companyDescription).trim() || undefined,
        industry: str(industry).trim() || undefined,
        products: str(products).trim() || undefined,
        brandTone: str(brandTone).trim() || undefined,
        targetAudience: str(targetAudience).trim() || undefined,
        uniqueSellingPoint: str(uniqueSellingPoint).trim() || undefined,
      });
      // Reset
      setCompanyName('');
      setCompanyUrl('');
      setCompanyDescription('');
      setIndustry('');
      setProducts('');
      setBrandTone('');
      setTargetAudience('');
      setUniqueSellingPoint('');
      setSuccessMsg(null);
      onClose();
    } catch (err: any) {
      setError(err.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Company Name */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <Building2 size={14} />
              公司名稱 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="例如：Xapto Studio"
              className={inputClass}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Company URL + Analyze Button */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <Globe size={14} />
              公司網址 <span className="text-zinc-400 text-xs">（可選）</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="例如：https://xapto.studio"
                className={`${inputClass} flex-1`}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !companyUrl.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    🤖 自動分析網站
                  </>
                )}
              </button>
            </div>
            {analyzeError && (
              <p className="text-xs text-red-500 mt-1">{analyzeError}</p>
            )}
            {isAnalyzing && (
              <p className="text-xs text-zinc-400 mt-1">正在分析網站內容，請稍候...</p>
            )}
          </div>

          {/* Company Description */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              <FileText size={14} />
              公司描述 <span className="text-zinc-400 text-xs">（可選）</span>
            </label>
            <textarea
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="簡單描述公司業務、產品或服務..."
              rows={2}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-1">
            <p className="text-xs text-zinc-400 mb-3">
              {successMsg || 'AI 分析結果（可手動修改）'}
            </p>
          </div>

          {/* AI Analysis Fields */}
          <div className="grid grid-cols-2 gap-3">
            {/* Industry */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 mb-1">
                <Briefcase size={12} />
                行業類別
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="例如：文創"
                className={`${inputClass} text-xs py-2`}
              />
            </div>

            {/* Brand Tone */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 mb-1">
                <Eye size={12} />
                品牌語氣
              </label>
              <input
                type="text"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                placeholder="例如：簡約、溫暖"
                className={`${inputClass} text-xs py-2`}
              />
            </div>
          </div>

          {/* Products */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 mb-1">
              <ShoppingBag size={12} />
              產品/服務
            </label>
            <textarea
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              placeholder="例如：手工卡紙、信封、包裝紙"
              rows={2}
              className={`${inputClass} resize-none text-xs`}
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 mb-1">
              <Users size={12} />
              目標客群
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="例如：鍾意手作嘅年輕人"
              className={inputClass}
            />
          </div>

          {/* Unique Selling Point */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 mb-1">
              <Star size={12} />
              獨特賣點
            </label>
            <input
              type="text"
              value={uniqueSellingPoint}
              onChange={(e) => setUniqueSellingPoint(e.target.value)}
              placeholder="例如：本地設計、環保紙張"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !companyName.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                儲存中...
              </>
            ) : (
              '建立專案'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
