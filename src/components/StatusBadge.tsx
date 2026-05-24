import { TaskStatus } from '@/lib/types';

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const colors: Record<string, string> = {
    '未着手': 'bg-gray-100 text-gray-800',
    '対応中': 'bg-blue-100 text-blue-800',
    '完了': 'bg-green-100 text-green-800',
    '保留': 'bg-yellow-100 text-yellow-800',
    '要確認': 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[status] || colors['未着手']}`}>
      {status}
    </span>
  );
}
