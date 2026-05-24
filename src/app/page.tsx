import { getCurrentEmployeeId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { fetchFromGas } from '@/lib/gasClient';
import TaskCard from '@/components/TaskCard';
import Link from 'next/link';

export default async function Home() {
  const empId = await getCurrentEmployeeId();
  if (!empId) {
    redirect('/login');
  }

  const { data } = await fetchFromGas();
  
  if (!data) {
    return <div className="text-center p-10 text-red-500">データの取得に失敗しました。GASの設定（SHEET_IDやURL）を確認してください。</div>;
  }

  const employee = data.Employees.find(e => e.employee_id === empId);
  if (!employee) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 mb-4">社員IDが見つかりません: {empId}</p>
        <Link href="/login" className="text-indigo-600 underline">ログインし直す</Link>
      </div>
    );
  }

  const svStores = data.Stores.filter(s => s.sv_employee_id === empId);
  const svStoreIds = svStores.map(s => s.store_id);
  
  const svTasks = data.Tasks.filter(t => svStoreIds.includes(t.store_id));
  const unfinishedTasks = svTasks.filter(t => t.status !== '完了');
  const urgentTasks = unfinishedTasks.filter(t => t.priority === '高');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">こんにちは、{employee.name} さん</h1>
        <p className="mt-1 text-sm text-gray-500">本日のタスク状況をお知らせします。</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">未完了タスク</dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">{unfinishedTasks.length}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">優先度: 高</dt>
            <dd className="mt-1 text-3xl font-semibold text-red-600">{urgentTasks.length}</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">担当店舗数</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{svStores.length}</dd>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">優先タスク (直近の5件)</h2>
          <Link href="/tasks" className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">すべて見る &rarr;</Link>
        </div>
        
        {urgentTasks.length === 0 && unfinishedTasks.length === 0 ? (
          <p className="text-gray-500 text-sm">現在、未完了のタスクはありません！素晴らしいです👏</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(urgentTasks.length > 0 ? urgentTasks : unfinishedTasks).slice(0, 5).map(task => (
              <TaskCard 
                key={task.task_id} 
                task={task} 
                store={svStores.find(s => s.store_id === task.store_id)}
                campaign={data.Campaigns.find(c => c.campaign_id === task.campaign_id)}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-center pb-12">
        <Link href="/report" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105">
          ✨ AI一括報告を始める
        </Link>
      </div>
    </div>
  );
}
