export type TaskStatus = '未着手' | '対応中' | '完了' | '保留' | '要確認';
export type Role = 'SV' | 'Manager' | 'HQ' | 'Admin';
export type EventType = 'created' | 'status_changed' | 'memo_added' | 'ai_update' | 'manual_update';

export type Task = {
  task_id: string;
  campaign_id: string;
  store_id: string;
  assigned_employee_id: string;
  status: TaskStatus;
  latest_memo?: string;
  latest_event_id?: string;
  due_date?: string;
  priority?: '高' | '中' | '低';
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
  active?: boolean;
};

export type Store = {
  store_id: string;
  store_code?: string;
  store_name: string;
  store_name_kana?: string;
  aliases?: string;
  business_type?: string;
  area?: string;
  prefecture?: string;
  sv_employee_id?: string;
  active?: boolean;
};

export type Campaign = {
  campaign_id: string;
  campaign_name: string;
  description?: string;
  target_business_type?: string;
  target_area?: string;
  target_store_ids?: string;
  owner_employee_id?: string;
  default_assignee_type?: string;
  default_assignee_id?: string;
  due_date?: string;
  priority?: string;
  rollout_status?: string;
};

export type Employee = {
  employee_id: string;
  name: string;
  email: string;
  role: string;
};

export type AiParsedReport = {
  intent: 'update_task_status' | 'add_memo' | 'ask_question' | 'create_issue' | 'unknown';
  storeMentions: string[];
  campaignMentions: string[];
  status?: TaskStatus;
  memo?: string;
  nextAction?: string;
  needsFollowUp: boolean;
  confidence: number;
  ambiguityReason?: string;
};

export type TaskMatchResult = {
  matchType: 'single' | 'multiple' | 'none';
  candidates: Task[];
  reason: string;
};

export type UpdateRequest = {
  requestId: string;
  actorEmployeeId: string;
  taskId: string;
  statusAfter: TaskStatus;
  memo?: string;
  rawInput: string;
  aiJson: AiParsedReport;
  source: 'web' | 'mobile';
};

export type GasFetchResponse = {
  success: boolean;
  data?: {
    Tasks: Task[];
    Campaigns: Campaign[];
    Stores: Store[];
    Employees: Employee[];
  };
  error?: string;
};
