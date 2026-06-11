'use client';

import { useState, useEffect } from 'react';
import { AI_PROVIDERS, getProviderConfig } from '@/lib/ai/providers';
import type { AIProvider } from '@/types';
import { ChevronDown, Check, Key, Save } from 'lucide-react';

export default function ProviderSelector() {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('OpenAI');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [openProvider, setOpenProvider] = useState(false);
  const [openModel, setOpenModel] = useState(false);

  const config = getProviderConfig(selectedProvider);
  const models = config?.models ?? [];

  useEffect(() => {
    const savedProvider = localStorage.getItem('pulse_provider') as AIProvider | null;
    const savedModel = localStorage.getItem('pulse_model');
    const savedKey = localStorage.getItem('pulse_api_key');
    if (savedProvider) setSelectedProvider(savedProvider);
    if (savedModel) setSelectedModel(savedModel);
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    const cfg = getProviderConfig(provider);
    if (cfg) setSelectedModel(cfg.defaultModel);
    setOpenProvider(false);
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem('pulse_provider', selectedProvider);
    localStorage.setItem('pulse_model', selectedModel);
    localStorage.setItem('pulse_api_key', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">API 設定</h2>

      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          AI Provider
        </label>
        <div className="relative">
          <button
            onClick={() => setOpenProvider(!openProvider)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
          >
            {selectedProvider}
            <ChevronDown size={16} />
          </button>
          {openProvider && (
            <div className="absolute top-full mt-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-1 z-20 max-h-64 overflow-y-auto">
              {AI_PROVIDERS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleProviderChange(p.name)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                    selectedProvider === p.name
                      ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {p.name}
                  {selectedProvider === p.name && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Model Selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Model
        </label>
        <div className="relative">
          <button
            onClick={() => setOpenModel(!openModel)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
          >
            {selectedModel}
            <ChevronDown size={16} />
          </button>
          {openModel && (
            <div className="absolute top-full mt-1 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-1 z-20 max-h-48 overflow-y-auto">
              {models.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedModel(m);
                    setOpenModel(false);
                    setSaved(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between ${
                    selectedModel === m
                      ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {m}
                  {selectedModel === m && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* API Key */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          <Key size={14} className="inline mr-1" />
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            setSaved(false);
          }}
          placeholder={`輸入你嘅 ${config?.apiKeyLabel ?? 'API Key'}...`}
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
        />
        <p className="text-xs text-zinc-400 mt-1">
          API Key 只會儲存喺你嘅瀏覽器，唔會上載到伺服器
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity"
      >
        {saved ? (
          <>
            <Check size={16} />
            已儲存
          </>
        ) : (
          <>
            <Save size={16} />
            儲存設定
          </>
        )}
      </button>
    </div>
  );
}
