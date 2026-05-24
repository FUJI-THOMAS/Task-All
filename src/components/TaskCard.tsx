'use client';
import { Task, Store, Campaign } from '@/lib/types';
import StatusBadge from './StatusBadge';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { updateTaskAction } from '../app/tasks/actions';

interface Props {
  task: Task;
  store?: Store;
  campaign?: Campaign;
}

export default function TaskCard({ task, store, campaign }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleComplete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation if we wrapped it, but we removed Link wrapping
    startTransition(async () => {
      try {
        const result = await updateTaskAction(task.task_id, '完了', '一覧から完了');
        if (!result.success) {
          alert(`エラー: ${result.error}`);
        }
      } catch (err) {
        alert('通信エラーが発生しました');
      }
    });
  };

  return (
    <div className={`bg-white shadow rounded-xl p-5 hover:shadow-md transition-all border border-gray-100 h-full flex flex-col relative ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <Link href={`/tasks/${task.task_id}`} className="hover:underline">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
            {store?.store_name || '不明な店舗'}
          </h3>
        </Link>
        <StatusBadge status={task.status} />
      </div>
      
      <p className="text-sm text-gray-600 mb-4 font-medium flex-1">
        {campaign?.campaign_name || '不明な施策'}
      </p>
      
      <div className="mb-4">
        {task.latest_memo ? (
          <p className="text-xs text-gray-500 line-clamp-2 bg-gray-50 p-2 rounded border border-gray-100">
            📝 {task.latest_memo}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">メモなし</p>
        )}
      </div>

      <div className="flex justify-between items-center text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
        <span>期日: {task.due_date ? new Date(task.due_date).toLocaleDateString() : '未設定'}</span>
        <span>優先度: {task.priority || '中'}</span>
      </div>

      {task.status !== '完了' && (
        <button 
          onClick={handleComplete} 
          disabled={isPending}
          className="mt-4 w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg py-2.5 text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ワンタップ完了
            </>
          )}
        </button>
      )}
    </div>
  );
}
