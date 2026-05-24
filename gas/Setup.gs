/**
 * スプレッドシートの初期セットアップを一括で行うヘルパー関数です。
 * 
 * 使い方：
 * 1. 新規スプレッドシートを作成し、「拡張機能」＞「Apps Script」を開く。
 * 2. この関数 (`setupSpreadsheet`) を選択して「実行」ボタンを押す。
 */
function setupSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("このスクリプトはスプレッドシートにバインドされている必要があります（拡張機能＞Apps Script から開いてください）。");
  }

  // 作成するシートとカラムの定義（計画書 §5 準拠）
  var schemas = {
    'Employees': [
      'employee_id', 'employee_code', 'name', 'email', 'role', 
      'department', 'active', 'created_at', 'updated_at'
    ],
    'Stores': [
      'store_id', 'store_code', 'store_name', 'store_name_kana', 'aliases', 
      'business_type', 'area', 'prefecture', 'sv_employee_id', 'active', 
      'created_at', 'updated_at'
    ],
    'Campaigns': [
      'campaign_id', 'campaign_name', 'description', 'target_business_type', 
      'target_area', 'target_store_ids', 'owner_employee_id', 'default_assignee_type', 
      'default_assignee_id', 'due_date', 'priority', 'rollout_status', 
      'rollout_executed_at', 'created_by', 'created_at', 'updated_at'
    ],
    'Tasks': [
      'task_id', 'campaign_id', 'store_id', 'assigned_employee_id', 'status', 
      'latest_memo', 'latest_event_id', 'due_date', 'priority', 'created_by', 
      'created_at', 'updated_by', 'updated_at', 'active'
    ],
    'TaskEvents': [
      'event_id', 'task_id', 'actor_employee_id', 'event_type', 'status_before', 
      'status_after', 'memo', 'raw_input', 'ai_json', 'ai_confidence', 
      'request_id', 'source', 'created_at'
    ],
    'ErrorLogs': [
      'error_id', 'request_id', 'source', 'error_type', 'message', 'payload', 'created_at'
    ]
  };

  // 各シートを作成し、ヘッダを設定
  for (var sheetName in schemas) {
    var headers = schemas[sheetName];
    var sheet = ss.getSheetByName(sheetName);
    
    // シートが存在しなければ作成
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // ヘッダ行（1行目）を書き込み
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    
    // 1行目を固定、背景色をつけて見やすくする
    sheet.setFrozenRows(1);
    range.setBackground('#e0e0e0');
    range.setFontWeight('bold');
    
    // 不要な空白列を削除（見栄えとパフォーマンスのため）
    var maxCols = sheet.getMaxColumns();
    if (maxCols > headers.length) {
      sheet.deleteColumns(headers.length + 1, maxCols - headers.length);
    }
  }

  // デフォルトで作成される「シート1」などが残っていれば削除
  var allSheets = ss.getSheets();
  for (var i = 0; i < allSheets.length; i++) {
    var s = allSheets[i];
    if (!schemas[s.getName()]) {
      try {
        ss.deleteSheet(s);
      } catch (e) {
        // 全シートは削除できないため、エラーは無視
      }
    }
  }

  Logger.log("✅ 全シートのセットアップが完了しました！");
}
