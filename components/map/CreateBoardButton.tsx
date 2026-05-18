'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateBoardButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/boards', { method: 'POST' });
      const { code } = await res.json();
      router.push(`/board/${code}`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-100 disabled:opacity-60 transition-colors"
    >
      {loading ? 'Creating…' : 'Start shared wishlist board →'}
    </button>
  );
}
