/**
 * Repository for Tasks and TaskEvents sheets.
 */
function getSheetByName(name) {
  var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!sheetId) throw new Error("Missing SHEET_ID in Script Properties");
  var ss = SpreadsheetApp.openById(sheetId);
  return ss.getSheetByName(name);
}

function getHeaders(sheet) {
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  return range.getValues()[0];
}

function checkEventExists(requestId) {
  var sheet = getSheetByName('TaskEvents');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var reqIdIdx = headers.indexOf('request_id');
  
  if (reqIdIdx === -1) return false;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][reqIdIdx] === requestId) {
      return true; // Already exists (Idempotency)
    }
  }
  return false;
}

function updateTask(taskId, statusAfter, memo, updatedBy) {
  var sheet = getSheetByName('Tasks');
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  var taskIdIdx = headers.indexOf('task_id');
  var statusIdx = headers.indexOf('status');
  var memoIdx = headers.indexOf('latest_memo');
  var updatedByIdx = headers.indexOf('updated_by');
  var updatedAtIdx = headers.indexOf('updated_at');
  
  if (taskIdIdx === -1) throw new Error("Tasks sheet format error: missing task_id column");
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][taskIdIdx] === taskId) {
      var row = i + 1;
      var statusBefore = data[i][statusIdx];
      
      sheet.getRange(row, statusIdx + 1).setValue(statusAfter);
      if (memo !== undefined && memo !== null) {
        sheet.getRange(row, memoIdx + 1).setValue(memo);
      }
      sheet.getRange(row, updatedByIdx + 1).setValue(updatedBy);
      sheet.getRange(row, updatedAtIdx + 1).setValue(new Date());
      
      return statusBefore;
    }
  }
  throw new Error("Task not found: " + taskId);
}

function appendEvent(eventData) {
  var sheet = getSheetByName('TaskEvents');
  var headers = getHeaders(sheet);
  
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    row.push(eventData[key] !== undefined ? eventData[key] : "");
  }
  
  sheet.appendRow(row);
}

function fetchData() {
  var data = {};
  var sheetsToFetch = ['Tasks', 'Campaigns', 'Stores', 'Employees'];
  
  for (var i = 0; i < sheetsToFetch.length; i++) {
    var sheetName = sheetsToFetch[i];
    var sheet = getSheetByName(sheetName);
    if (!sheet) continue;
    
    var rangeData = sheet.getDataRange().getValues();
    if (rangeData.length <= 1) {
      data[sheetName] = [];
      continue;
    }
    
    var headers = rangeData[0];
    var rows = [];
    for (var r = 1; r < rangeData.length; r++) {
      var rowObj = {};
      for (var c = 0; c < headers.length; c++) {
        rowObj[headers[c]] = rangeData[r][c];
      }
      rows.push(rowObj);
    }
    data[sheetName] = rows;
  }
  return data;
}

function rolloutCampaign(campaignId, actorEmployeeId) {
  var campaignsSheet = getSheetByName("Campaigns");
  var campaignsData = campaignsSheet.getDataRange().getValues();
  var headers = campaignsData[0];
  var campIdIdx = headers.indexOf("campaign_id");
  var statusIdx = headers.indexOf("rollout_status");
  var executedAtIdx = headers.indexOf("rollout_executed_at");
  var targetAreaIdx = headers.indexOf("target_area");
  
  var campaignRowIdx = -1;
  var campaign = null;
  for (var i = 1; i < campaignsData.length; i++) {
    if (campaignsData[i][campIdIdx] === campaignId) {
      campaignRowIdx = i;
      campaign = campaignsData[i];
      break;
    }
  }
  
  if (!campaign) throw new Error("Campaign not found");
  if (campaign[statusIdx] === "展開済") return { success: true, message: "既に展開済みです", newTasksCount: 0 };
  
  var targetArea = (targetAreaIdx !== -1) ? (campaign[targetAreaIdx] || "すべて") : "すべて";
  var dueDate = headers.indexOf("due_date") !== -1 ? campaign[headers.indexOf("due_date")] : null;
  var priority = headers.indexOf("priority") !== -1 ? campaign[headers.indexOf("priority")] : "中";
  
  var storesSheet = getSheetByName("Stores");
  var storesData = storesSheet.getDataRange().getValues();
  var sHeaders = storesData[0];
  var sIdIdx = sHeaders.indexOf("store_id");
  var sAreaIdx = sHeaders.indexOf("area");
  var svIdIdx = sHeaders.indexOf("sv_employee_id");
  var sActiveIdx = sHeaders.indexOf("active");
  
  var targetStoreIds = [];
  var storeSvMap = {};
  for (var j = 1; j < storesData.length; j++) {
    var store = storesData[j];
    if (store[sActiveIdx] !== true && store[sActiveIdx] !== "TRUE" && store[sActiveIdx] !== "true") continue;
    if (targetArea !== "すべて" && targetArea !== "全国" && store[sAreaIdx] !== targetArea) continue;
    
    targetStoreIds.push(store[sIdIdx]);
    storeSvMap[store[sIdIdx]] = store[svIdIdx];
  }
  
  var tasksSheet = getSheetByName("Tasks");
  var tasksData = tasksSheet.getDataRange().getValues();
  var tHeaders = tasksData[0];
  var tCampIdIdx = tHeaders.indexOf("campaign_id");
  var tStoreIdIdx = tHeaders.indexOf("store_id");
  
  var existingPairs = {};
  for (var k = 1; k < tasksData.length; k++) {
    var t = tasksData[k];
    existingPairs[t[tCampIdIdx] + "_" + t[tStoreIdIdx]] = true;
  }
  
  var newTasksCount = 0;
  for (var s = 0; s < targetStoreIds.length; s++) {
    var sId = targetStoreIds[s];
    if (existingPairs[campaignId + "_" + sId]) continue;
    
    var taskId = Utilities.getUuid();
    var svId = storeSvMap[sId];
    var now = new Date();
    
    tasksSheet.appendRow([
      taskId, campaignId, sId, svId, "未着手", "", "", dueDate, priority, actorEmployeeId, now, actorEmployeeId, now, true
    ]);
    
    appendEvent({
      event_id: Utilities.getUuid(),
      task_id: taskId,
      actor_employee_id: actorEmployeeId,
      event_type: "created",
      status_after: "未着手",
      source: "web",
      created_at: now
    });
    
    newTasksCount++;
  }
  
  campaignsSheet.getRange(campaignRowIdx + 1, statusIdx + 1).setValue("展開済");
  if (executedAtIdx !== -1) {
    campaignsSheet.getRange(campaignRowIdx + 1, executedAtIdx + 1).setValue(new Date());
  }
  
  return { success: true, newTasksCount: newTasksCount, message: "タスクを展開しました" };
}
