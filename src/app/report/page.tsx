import { getCurrentEmployeeId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { fetchFromGas } from '@/lib/gasClient';
import ReportClient from './ReportClient';

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ task_id?: string }> }) {
  const resolvedParams = await searchParams;
  const empId = await getCurrentEmployeeId();
  if (!empId) redirect('/login');

  const { data } = await fetchFromGas();
  if (!data) return <div className="text-center p-10 text-red-500">エラー: データの取得に失敗しました</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">✨ AI一括報告</h1>
        <p className="mt-1 text-sm text-gray-500">
          「上尾店の秋キャンペーン終わりました」のように、自然な言葉で報告を入力してください。<br/>
          AIが対象のタスクを特定し、ステータスを更新します。
        </p>
      </div>

      <ReportClient 
        empId={empId} 
        tasks={data.Tasks} 
        stores={data.Stores} 
        campaigns={data.Campaigns} 
        initialTaskId={resolvedParams.task_id}
      />
    </div>
  );
}
