import { Task, Store, Campaign, TaskMatchResult, AiParsedReport } from './types';

/**
 * Deterministically match the AI parsed mentions to actual DB entities using aliases.
 */
export function matchTask(
  report: AiParsedReport,
  tasks: Task[],
  stores: Store[],
  campaigns: Campaign[],
  svEmployeeId: string
): TaskMatchResult {
  // 1. Find matched stores based on storeMentions and aliases
  const matchedStores = stores.filter(store => {
    // Only consider stores managed by the current SV
    if (store.sv_employee_id !== svEmployeeId) return false;
    
    const aliases = store.aliases ? store.aliases.split(',').map(s => s.trim()) : [];
    const keywords = [store.store_name, store.store_name_kana, ...aliases].filter(Boolean) as string[];
    
    return report.storeMentions.some(mention => 
      keywords.some(kw => kw.includes(mention) || mention.includes(kw))
    );
  });

  if (matchedStores.length === 0) {
    return { matchType: 'none', candidates: [], reason: '報告内容に一致する担当店舗が見つかりませんでした。' };
  }

  // 2. Find matching campaigns
  const matchedCampaigns = campaigns.filter(campaign => {
    return report.campaignMentions.some(mention => 
      campaign.campaign_name.includes(mention) || mention.includes(campaign.campaign_name)
    );
  });

  // 3. Find candidate tasks
  const candidates = tasks.filter(task => {
    // Check if task belongs to one of the matched stores
    const storeMatch = matchedStores.some(s => s.store_id === task.store_id);
    if (!storeMatch) return false;

    // Check if task matches the mentioned campaign (if any was mentioned)
    const campaignMatch = matchedCampaigns.length > 0 
      ? matchedCampaigns.some(c => c.campaign_id === task.campaign_id)
      : true; // If AI didn't catch a campaign, consider all tasks for that store
      
    // Usually we only update unfinished tasks
    const isUnfinished = task.status !== '完了';
    
    return campaignMatch && isUnfinished;
  });

  if (candidates.length === 0) {
    return { matchType: 'none', candidates: [], reason: '一致する未完了タスクがありませんでした。' };
  }
  
  if (candidates.length === 1) {
    return { matchType: 'single', candidates, reason: 'タスクを特定しました。' };
  }

  return { matchType: 'multiple', candidates, reason: '複数のタスク候補があります。対象を選択してください。' };
}
