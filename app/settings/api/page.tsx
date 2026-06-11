'use client';

import AuthGuard from '@/components/AuthGuard';
import ProviderSelector from '@/components/ProviderSelector';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ApiSettingsPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-8"
          >
            <ArrowLeft size={16} />
            返回主頁
          </Link>
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8">
            <ProviderSelector />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
