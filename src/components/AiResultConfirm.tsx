import { AiParsedReport, TaskMatchResult, TaskStatus } from '@/lib/types';

interface Props {
  report: AiParsedReport;
  matchResult: TaskMatchResult;
  onConfirm: (taskId: string, status: TaskStatus, memo: string) => void;
  onCancel: () => void;
}

export default function AiResultConfirm({ report, matchResult, onConfirm, onCancel }: Props) {
  return (
    <div className="bg-white shadow sm:rounded-lg border border-indigo-100 p-6 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-medium leading-6 text-indigo-900 flex items-center gap-2 mb-4">
        ✨ AI解析結果
      </h3>
      
      <div className="space-y-4">
        <div className="bg-indigo-50 p-4 rounded-md">
          <p className="text-sm font-medium text-indigo-800">抽出された店舗:</p>
          <p className="text-sm text-indigo-700">{report.storeMentions.join(', ') || 'なし'}</p>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-md">
          <p className="text-sm font-medium text-indigo-800">更新内容:</p>
          <p className="text-sm text-indigo-700">ステータス: {report.status || '変更なし'}</p>
          <p className="text-sm text-indigo-700">メモ: {report.memo || 'なし'}</p>
        </div>

        {matchResult.matchType === 'single' && (
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <p className="text-sm font-medium text-green-800">対象タスクを1件特定しました！</p>
            <p className="text-sm text-green-700 mt-1">
              この内容でシステムに反映しますか？
            </p>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => onConfirm(matchResult.candidates[0].task_id, report.status || matchResult.candidates[0].status, report.memo || '')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                承認して送信
              </button>
              <button
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {matchResult.matchType !== 'single' && (
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <p className="text-sm font-medium text-yellow-800">⚠️ {matchResult.reason}</p>
            {report.needsFollowUp && report.ambiguityReason && (
              <p className="text-sm text-yellow-700 mt-2 text-wrap whitespace-pre-wrap">AIコメント: {report.ambiguityReason}</p>
            )}
            <div className="mt-4">
              <button
                onClick={onCancel}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
              >
                戻って手動で修正する
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
