'use client';

import { useState } from 'react';
import type { Pin, PendingPin } from '@/lib/types';

const COLORS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#f43f5e', label: 'Rose' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#10b981', label: 'Emerald' },
];

interface Props {
  pendingPin: PendingPin;
  boardCode: string;
  onSuccess: (pin: Pin) => void;
  onClose: () => void;
}

export default function AddPinModal({ pendingPin, boardCode, onSuccess, onClose }: Props) {
  const [label, setLabel] = useState('');
  const [author, setAuthor] = useState('');
  const [color, setColor] = useState(COLORS[0].value);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/boards/${boardCode}/pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...pendingPin, label: label.trim(), author: author.trim() || 'anon', color }),
      });
      if (res.ok) {
        const pin: Pin = await res.json();
        onSuccess(pin);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Add wishlist pin</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Label *</label>
          <input
            autoFocus
            required
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="e.g. Mestia hike"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your name</label>
          <input
            value={author}
            onChange={e => setAuthor(e.target.value)}
            placeholder="anon"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Color</label>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                title={c.label}
                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  background: c.value,
                  borderColor: color === c.value ? '#1e293b' : 'transparent',
                  boxShadow: color === c.value ? '0 0 0 2px white inset' : undefined,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !label.trim()}
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Add pin'}
          </button>
        </div>
      </form>
    </div>
  );
}
