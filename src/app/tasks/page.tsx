import { getCurrentEmployeeId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { fetchFromGas } from '@/lib/gasClient';
import TaskListClient from './TaskListClient';

export default async function TasksPage() {
  const empId = await getCurrentEmployeeId();
  if (!empId) redirect('/login');

  const { data } = await fetchFromGas();
  if (!data) {
    return <div className="text-center p-10 text-red-500">データの取得に失敗しました。</div>;
  }

  const svStores = data.Stores.filter(s => s.sv_employee_id === empId);
  const svStoreIds = svStores.map(s => s.store_id);
  
  const svTasks = data.Tasks.filter(t => svStoreIds.includes(t.store_id));

  // Sort: Unfinished first, then by priority (高 -> 中 -> 低)
  const priorityScore = (p?: string) => p === '高' ? 3 : p === '中' ? 2 : 1;
  const sortedTasks = [...svTasks].sort((a, b) => {
    if (a.status !== '完了' && b.status === '完了') return -1;
    if (a.status === '完了' && b.status !== '完了') return 1;
    return priorityScore(b.priority) - priorityScore(a.priority);
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">担当店舗タスク一覧</h1>
        <p className="mt-1 text-sm text-gray-500">全 {sortedTasks.length} 件</p>
      </div>

      <TaskListClient 
        tasks={sortedTasks} 
        stores={svStores} 
        campaigns={data.Campaigns} 
        empId={empId} 
      />
    </div>
  );
}
