import { getCurrentEmployeeId } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { fetchFromGas } from '@/lib/gasClient';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const empId = await getCurrentEmployeeId();
  if (!empId) redirect('/login');

  const { data } = await fetchFromGas();
  if (!data) return <div className="text-center p-10 text-red-500">データの取得に失敗しました</div>;

  const employee = data.Employees.find(e => e.employee_id === empId);
  if (!employee || (employee.role !== 'HQ' && employee.role !== 'Admin')) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス権限がありません</h1>
        <p>このページは本部担当者（HQ/Admin）専用です。</p>
      </div>
    );
  }

  const campaigns = data.Campaigns.filter(c => c.rollout_status !== '展開済');

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in zoom-in duration-300">
      <div className="mb-8 border-b pb-4 border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">🏢 本部管理画面</h1>
        <p className="mt-2 text-sm text-gray-500">
          登録された施策（キャンペーン）から、各対象店舗分のタスクを一括生成します。
        </p>
      </div>
      <AdminClient empId={empId} campaigns={campaigns} />
    </div>
  );
}
