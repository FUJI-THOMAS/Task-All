'use client';

import { useState } from 'react';
import { Campaign } from '@/lib/types';

export default function AdminClient({ empId, campaigns }: { empId: string, campaigns: Campaign[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleRollout = async (campaignId: string) => {
    if (!confirm('この施策のタスクを対象店舗に一括展開します。よろしいですか？')) return;
    
    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch('/api/rollout-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, actorEmployeeId: empId })
      });
      const json = await res.json();
      
      if (json.success) {
        setMessage('タスクの展開に成功しました。ページをリロードして結果をご確認ください。');
      } else {
        alert('エラーが発生しました: ' + json.error);
      }
    } catch (e) {
      alert('通信エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-bold mb-4 text-indigo-900 flex items-center">
        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        タスク展開待ちの施策
      </h2>
      
      {message && <div className="mb-4 p-4 bg-green-50 text-green-800 border border-green-200 rounded animate-in fade-in">{message}</div>}

      {campaigns.length === 0 ? (
        <p className="text-gray-500 bg-gray-50 p-4 rounded text-center">現在、展開待ちの施策はありません。</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {campaigns.map(c => (
            <li key={c.campaign_id} className="py-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 px-4 rounded transition-colors -mx-4">
              <div className="mb-3 sm:mb-0">
                <p className="font-bold text-gray-900 text-lg">{c.campaign_name}</p>
                <div className="text-sm text-gray-500 mt-1 space-y-1">
                  <p>ID: <span className="font-mono text-xs">{c.campaign_id}</span></p>
                  <p>対象エリア: <span className="font-medium text-gray-700">{c.target_area || 'すべて'}</span></p>
                  <p>期限: {c.due_date ? new Date(c.due_date).toLocaleDateString() : '未設定'}</p>
                </div>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                  {c.rollout_status || '未展開'}
                </span>
              </div>
              <button
                onClick={() => handleRollout(c.campaign_id)}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-md text-sm font-bold hover:bg-indigo-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
              >
                {isSubmitting ? '処理中...' : 'タスクを一括展開'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
