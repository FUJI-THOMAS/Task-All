/**
 * テスト用のダミーデータを一括でスプレッドシートに挿入する関数です。
 * ※すでにデータがある場合は追記されます。
 */
function generateDummyData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error("このスクリプトはスプレッドシートにバインドされている必要があります（拡張機能＞Apps Script から開いてください）。");
  }

  // Employees (社員マスタ)
  var empSheet = ss.getSheetByName("Employees");
  var employees = [
    ["E0001", "EMP-001", "山田 太郎", "yamada@example.com", "SV", "営業部", true, new Date(), new Date()],
    ["E0002", "EMP-002", "鈴木 花子", "suzuki@example.com", "SV", "営業部", true, new Date(), new Date()]
  ];
  employees.forEach(function(row) { empSheet.appendRow(row); });

  // Stores (店舗マスタ)
  var storeSheet = ss.getSheetByName("Stores");
  var stores = [
    ["S0001", "ST-001", "上尾店", "アゲオテン", "上尾, あげお", "直営", "関東", "埼玉県", "E0001", true, new Date(), new Date()],
    ["S0002", "ST-002", "大宮東口店", "オオミヤヒガシグチテン", "大宮, 東口", "FC", "関東", "埼玉県", "E0001", true, new Date(), new Date()],
    ["S0003", "ST-003", "新宿西口店", "シンジュクニシグチテン", "新宿, 西口", "直営", "関東", "東京都", "E0002", true, new Date(), new Date()]
  ];
  stores.forEach(function(row) { storeSheet.appendRow(row); });

  // Campaigns (施策マスタ)
  var campSheet = ss.getSheetByName("Campaigns");
  var nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  var nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  var campaigns = [
    ["C0001", "秋の陳列キャンペーン", "秋物商品の特設コーナー設置", "すべて", "関東", "", "E0001", "SV", "", nextWeek, "高", "展開中", new Date(), "E0001", new Date(), new Date()],
    ["C0002", "レジ横POP差し替え", "全店舗共通のレジ横POPを最新版に更新", "すべて", "全国", "", "E0001", "SV", "", nextMonth, "中", "展開中", new Date(), "E0001", new Date(), new Date()]
  ];
  campaigns.forEach(function(row) { campSheet.appendRow(row); });

  // Tasks (タスク)
  var taskSheet = ss.getSheetByName("Tasks");
  var tasks = [
    ["T0001", "C0001", "S0001", "E0001", "未着手", "早めに着手すること", "", nextWeek, "高", "E0001", new Date(), "E0001", new Date(), true],
    ["T0002", "C0001", "S0002", "E0001", "対応中", "資材到着待ちです", "", nextWeek, "高", "E0001", new Date(), "E0001", new Date(), true],
    ["T0003", "C0002", "S0001", "E0001", "未着手", "", "", nextMonth, "中", "E0001", new Date(), "E0001", new Date(), true],
    ["T0004", "C0001", "S0003", "E0002", "未着手", "", "", nextWeek, "高", "E0001", new Date(), "E0001", new Date(), true]
  ];
  tasks.forEach(function(row) { taskSheet.appendRow(row); });

  Logger.log("✅ ダミーデータの流し込みが完了しました！");
}
