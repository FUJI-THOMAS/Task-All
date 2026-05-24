import { getCurrentEmployeeId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { fetchFromGas } from '@/lib/gasClient';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const resolvedParams = await params;
  const taskId = resolvedParams.taskId;
  const empId = await getCurrentEmployeeId();
  if (!empId) redirect('/login');

  const { data } = await fetchFromGas();
  if (!data) return <div>エラー</div>;

  const task = data.Tasks.find(t => t.task_id === taskId);
  if (!task) return <div className="text-center p-10">タスクが見つかりません</div>;

  const store = data.Stores.find(s => s.store_id === task.store_id);
  const campaign = data.Campaigns.find(c => c.campaign_id === task.campaign_id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Link href="/tasks" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium transition-colors">
          &larr; タスク一覧に戻る
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-100 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">タスク詳細</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {task.task_id}</p>
          </div>
          <StatusBadge status={task.status} />
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">対象店舗</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{store?.store_name || task.store_id}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">キャンペーン・施策</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{campaign?.campaign_name || task.campaign_id}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">優先度 / 期日</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {task.priority || '中'} / {task.due_date ? new Date(task.due_date).toLocaleDateString() : '未設定'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
              <dt className="text-sm font-medium text-gray-500">最新メモ</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                {task.latest_memo || 'メモはありません'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Link href={`/report?task_id=${task.task_id}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          このタスクについて報告する
        </Link>
      </div>
    </div>
  );
}
