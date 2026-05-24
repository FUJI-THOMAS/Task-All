'use client';
import { useState } from 'react';
import { Task, Store, Campaign } from '@/lib/types';
import TaskCard from '@/components/TaskCard';
import ReportClient from '../report/ReportClient';
import { useRouter } from 'next/navigation';

interface Props {
  tasks: Task[];
  stores: Store[];
  campaigns: Campaign[];
  empId: string;
}

export default function TaskListClient({ tasks, stores, campaigns, empId }: Props) {
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {tasks.map(task => (
           <TaskCard 
             key={task.task_id} 
             task={task} 
             store={stores.find(s => s.store_id === task.store_id)}
             campaign={campaigns.find(c => c.campaign_id === task.campaign_id)}
           />
        ))}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowVoiceModal(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-5 rounded-full shadow-2xl hover:bg-indigo-700 hover:scale-105 transition-all z-40 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-300"
        title="AIマイク報告"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>

      {/* Voice Report Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in slide-in-bottom-8">
            <button 
              onClick={() => setShowVoiceModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors z-10"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="p-6 pt-10">
               <ReportClient 
                 empId={empId}
                 tasks={tasks}
                 stores={stores}
                 campaigns={campaigns}
                 onSuccess={() => {
                   setShowVoiceModal(false);
                   router.refresh();
                 }}
               />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
