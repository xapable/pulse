'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Save, Check } from 'lucide-react';

export default function UserProfileForm() {
  const { user, profile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;
    try {
      const { createUserProfile } = await import('@/lib/firebase/firestore');
      await createUserProfile({
        userId: user.uid,
        email: user.email ?? '',
        displayName: displayName.trim(),
        photoURL: user.photoURL ?? undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('儲存失敗:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">個人資料</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        {profile?.photoURL ? (
          <img
            src={profile.photoURL}
            alt=""
            className="w-16 h-16 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
            <User size={28} className="text-zinc-400" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {profile?.displayName ?? '用戶'}
          </p>
          <p className="text-xs text-zinc-400">{profile?.email}</p>
        </div>
      </div>

      {/* Display Name */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          顯示名稱
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setSaved(false);
          }}
          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
        />
      </div>

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
            儲存變更
          </>
        )}
      </button>
    </div>
  );
}
