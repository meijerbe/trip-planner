'use client';

import { useState } from 'react';

export default function BoardHeader({ boardCode }: { boardCode: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase mb-1">Shared Wishlist</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Board #{boardCode}</h1>
      </div>
      <button
        onClick={copy}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}
