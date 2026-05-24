'use client';

import { useState, useEffect, useRef } from 'react';
import { Task, Store, Campaign, AiParsedReport, TaskMatchResult, TaskStatus } from '@/lib/types';
import { matchTask } from '@/lib/taskMatcher';
import AiResultConfirm from '@/components/AiResultConfirm';

interface Props {
  empId: string;
  tasks: Task[];
  stores: Store[];
  campaigns: Campaign[];
  initialTaskId?: string;
  onSuccess?: () => void;
}

export default function ReportClient({ empId, tasks, stores, campaigns, initialTaskId, onSuccess }: Props) {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [report, setReport] = useState<AiParsedReport | null>(null);
  const [matchResult, setMatchResult] = useState<TaskMatchResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ja-JP';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setText(prev => prev + (prev ? ' ' : '') + transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        alert('お使いのブラウザは音声入力に対応していません。ChromeまたはSafariをご利用ください。');
      }
    }
  };

  const handleParse = async () => {
    if (!text.trim()) return;
    setIsParsing(true);
    setReport(null);
    setMatchResult(null);
    setSuccessMessage('');

    try {
      const res = await fetch('/api/parse-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const json = await res.json();
      
      if (json.success && json.data) {
        setReport(json.data);
        const match = matchTask(json.data, tasks, stores, campaigns, empId);
        setMatchResult(match);
      } else {
        alert('AI解析に失敗しました: ' + (json.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('通信エラーが発生しました');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = async (taskId: string, statusAfter: TaskStatus, memo: string) => {
    if (!report) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/submit-task-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: `req_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          actorEmployeeId: empId,
          taskId: taskId,
          statusAfter: statusAfter,
          memo: memo,
          rawInput: text,
          aiJson: report,
          source: 'web'
        })
      });
      const json = await res.json();
      
      if (json.success) {
        setSuccessMessage('更新が完了しました！シートに反映されています。');
        setText('');
        setReport(null);
        setMatchResult(null);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert('更新に失敗しました: ' + json.error);
      }
    } catch (e) {
      console.error(e);
      alert('通信エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 flex items-center justify-between animate-in fade-in zoom-in duration-300">
          <span className="font-medium text-sm">{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800 font-medium text-sm">閉じる</button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 border border-gray-100 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="report" className="block text-sm font-medium text-gray-700">
            報告内容を入力
          </label>
          <button
            type="button"
            onClick={toggleListening}
            className={`inline-flex items-center px-3 py-1.5 border rounded-full text-sm font-medium transition-colors ${
              isListening 
                ? 'border-red-500 text-red-600 bg-red-50 hover:bg-red-100' 
                : 'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
            }`}
          >
            {isListening ? (
              <>
                <span className="w-2 h-2 mr-2 bg-red-600 rounded-full animate-pulse"></span>
                音声認識中...
              </>
            ) : (
              <>
                🎤 マイクで入力
              </>
            )}
          </button>
        </div>
        <textarea
          id="report"
          rows={5}
          className="shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md p-3 transition-shadow"
          placeholder="例: 上尾店で進めていた秋キャンペーンの設置が完了しました。お客様の反応も上々です。"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleParse}
            disabled={isParsing || !text.trim()}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              isParsing || !text.trim() ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            } transition-all`}
          >
            {isParsing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AIが解析中...
              </>
            ) : '解析する'}
          </button>
        </div>
      </div>

      {report && matchResult && (
        <AiResultConfirm 
          report={report} 
          matchResult={matchResult} 
          onConfirm={handleConfirm}
          onCancel={() => {
            setReport(null);
            setMatchResult(null);
          }}
        />
      )}
      
      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4 animate-in fade-in zoom-in duration-300">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-lg font-medium text-gray-900">システムに更新を送信中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
