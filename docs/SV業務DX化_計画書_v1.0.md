# SV業務DX化基盤 計画書 v1.0

**プロジェクト名**：FC本部 SV業務DX化基盤（仮称：ラストワンマイル実行基盤）
**版数**：v1.0
**作成日**：2026年5月23日
**対象読者**：開発担当者（=自分）／上司／経営層／パイロット参加SV

---

## 0. エグゼクティブサマリー

本計画は、自動車整備・板金フランチャイズ本部における**SV業務のラストワンマイル実行を可視化・自動化する業務DX基盤**の設計および段階的構築計画である。

本部から各SVへの施策指示は、メール・チャット・Salesforce・スプレッドシート・口頭などに分散しており、各SV（約50店舗を担当）の認知負荷を高め、抜け漏れ・報告遅延の温床となっている。本基盤はこの状況を、以下の3点で根本的に改善する。

1. 本部施策を**店舗別タスクとして自動展開**する
2. SVは**スマホから自然言語**で報告する（移動中の片手操作前提）
3. AIは**自然言語の構造化に限定**し、DB更新は人間確認を経る

技術スタックは **Vercel + Next.js + Gemini API + Google Apps Script + Google Sheets**。コストはGoogle Workspace基本料金内で完結する。

開発は **Phase 1（最小PoC）→ Phase 1.5（補強）→ Phase 2（小規模実運用）→ Phase 3（全社展開・Supabase移行）** の4段階。Phase 1は2〜3週間で1人開発、3SVへの試験導入を目指す。

本基盤の最大の価値は技術ではなく組織効果にある。すなわち、**SV個人の記憶力・根性に依存していた本部施策の実行を、データに依存させること**である。

---

## 1. 背景と目的

### 1.1 業務ドメイン

対象業務は自動車整備・板金フランチャイズ本部におけるSV（スーパーバイザー）業務である。各SVは担当エリアの加盟店約50店舗を巡回し、店舗状況確認・施策説明・キャンペーン推進・課題ヒアリング・経営支援を行う。日中の大半を車移動・訪問・電話対応に費やすため、**PC前提の業務システムは実務に合わない**。

### 1.2 現状課題

| 課題 | 内容 |
|---|---|
| 五月雨指示 | 本部施策がメール・チャット・会議・Salesforce・スプレッドシートなど複数経路で随時発生 |
| 高い認知負荷 | SVが「どの店舗に何を確認すべきか」を個人メモ・記憶に依存 |
| 入力負担 | Salesforce・AppSheet等は入力項目が多く、スマホ・車内では使えない |
| 進捗不可視 | 本部側で施策別・店舗別の実行状況がリアルタイムに見えず、個別確認連絡が増える |
| サイロ化 | Google Workspace、Cybozu、Salesforce、AppSheet、個別Excelが混在 |

### 1.3 本計画の目的

単なる営業報告ツールのデジタル化ではない。**本部施策のラストワンマイル実行をSV個人の記憶力に依存させず、タスクとして自動展開・実行管理・可視化することで、FC本部の施策実行力を底上げする**ことが目的である。

---

## 2. 目指す姿

### 2.1 コンセプト

> **本部施策を店舗別タスクに自動展開し、SVがスマホから自然言語で消し込める、ラストワンマイル実行基盤**

### 2.2 本部側のユーザー体験

1. 施策マスタに施策を1行登録する
2. 対象業態・対象エリア・担当者を指定する
3. 展開ボタンを押す
4. 対象店舗分のタスクが自動生成される
5. 進捗一覧で未対応・対応中・完了を見られる
6. 未対応店舗だけ絞ってフォローできる

### 2.3 SV側のユーザー体験

1. スマホで自分の未完了タスクだけを見る
2. 店舗訪問後、自然文（将来は音声）で報告する
3. AIが対象店舗・施策・ステータス・メモを候補表示する
4. SVが確認して送信する
5. タスクが更新され、履歴が残る

### 2.4 成功状態

- SVが「何をすべきか」を自分で探さなくてよい
- 本部が「誰がどこまでやったか」を個別確認しなくてよい
- 報告がPC前提ではなくスマホ・自然言語前提になる
- 施策ごとの実行状況が店舗別に見える
- 将来Supabase/PostgreSQLへ移行可能なデータ構造になっている

---

## 3. 設計原則（非交渉事項）

以下8項目はPhase 1から守る。後から導入する設計は技術的負債となる。

| # | 原則 | 理由 |
|---|---|---|
| 1 | **AIに直接DB更新させない** | 誤更新・店舗取り違え・暴走を防ぐ |
| 2 | **名前ではなくIDで更新する** | 店舗名・施策名・社員名の変更に耐える |
| 3 | **現在状態と履歴を分ける** | Tasks（現状）とTaskEvents（履歴）の2層 |
| 4 | **GASは薄く保つ** | 将来Supabaseへ置換できるよう、業務ロジックを詰め込まない |
| 5 | **API Route契約層を必ず挟む** | Next.js API Route → GAS の二段構成。Supabase移行時にここだけ差し替える |
| 6 | **store_id / campaign_id / task_id を最初から持つ** | task_id は **UUID推奨**（PostgreSQLのuuid型と整合） |
| 7 | **AI更新前に必ず確認画面を経由する** | Phase 1では自動更新ゼロ |
| 8 | **全書き込みをLockServiceでラップする** | 同時書き込みによるLost Update防止 |

---

## 4. システムアーキテクチャ

### 4.1 全体構成

```
[SVスマホ / PC]
    ↓
[Vercel / Next.js]
    - モバイルファーストUI
    - 認証（Phase 1.5でGoogleログイン）
    - タスク一覧表示
    - 自然言語入力（Phase 1.5で音声追加）
    - Gemini API連携
    - AI判定結果プレビュー
    ↓
[Next.js API Route]  ← 契約層（Supabase移行時の差し替え点）
    - 候補照合（taskMatcher）
    - バリデーション
    - request_id 生成
    - HMAC署名（Phase 1.5）
    ↓
[Gemini API]
    - 自然言語 → 構造化JSON
    - Structured Output（responseSchema固定）
    ↓
[Google Apps Script]
    - doPost受信
    - 共有シークレット検証（Phase 1）→ HMAC（Phase 1.5）
    - LockService 排他制御
    - Sheets更新
    - TaskEvents追記
    ↓
[Google Sheets]（共有Googleアカウント所有）
    - Employees
    - Stores（aliases付き）
    - Campaigns
    - Tasks
    - TaskEvents
    - ErrorLogs（Phase 1.5）
```

### 4.2 レイヤー別責務

| レイヤー | 採用技術 | 主な責務 |
|---|---|---|
| UI | Next.js / Vercel | SV向けモバイルUI、AI判定確認画面 |
| アプリケーション層 | Next.js API Route | 候補照合、バリデーション、署名、契約境界 |
| AI | Gemini API | 自然言語を構造化JSONへ変換するのみ |
| 暫定API | Google Apps Script | Sheets更新、排他、ログ追記 |
| 暫定DB | Google Sheets | マスタ、タスク、履歴 |
| 将来DB | Supabase / PostgreSQL | 本番データ基盤（Phase 3で移行） |

---

## 5. データ設計

### 5.1 設計方針

Google Sheetsを暫定DBとして使用するが、**設計思想はRDBに寄せる**。以下を徹底する。

- 主キーIDを持つ
- 外部キー相当のIDで関連づける
- 表示名を更新キーに使わない
- 現在状態と履歴を分ける
- 作成日時・更新日時・作成者・更新者を持つ
- 結合セル禁止、ヘッダ1行固定、空行禁止
- 1セルに複数値を入れない

### 5.2 Employees シート

社員・SV・本部担当者のマスタ。

| カラム | 型 | 必須 | 説明 |
|---|---|:-:|---|
| `employee_id` | string | ◯ | 社員ID（例：E0001）。**内部キー** |
| `employee_code` | string | | 既存社員CD |
| `name` | string | ◯ | 氏名 |
| `email` | string | ◯ | メールアドレス（認証用、キーではない） |
| `role` | string | ◯ | SV / Manager / Admin / HQ |
| `department` | string | | 所属部署 |
| `active` | boolean | ◯ | 有効フラグ |
| `created_at` | datetime | ◯ | 作成日時 |
| `updated_at` | datetime | ◯ | 更新日時 |

### 5.3 Stores シート

加盟店マスタ。**aliases列が本基盤の鋭さの中核**。

| カラム | 型 | 必須 | 説明 |
|---|---|:-:|---|
| `store_id` | string | ◯ | 店舗ID（例：S000123） |
| `store_code` | string | | 既存店舗コード |
| `store_name` | string | ◯ | 正式店舗名 |
| `store_name_kana` | string | | 店舗名カナ |
| `aliases` | string | | 略称・旧名（カンマ区切り） |
| `business_type` | string | ◯ | 板金専業 / 整備併設 / その他 |
| `area` | string | | エリア |
| `prefecture` | string | | 都道府県 |
| `sv_employee_id` | string | ◯ | 管轄SVのemployee_id |
| `active` | boolean | ◯ | 有効フラグ |
| `created_at` | datetime | ◯ | 作成日時 |
| `updated_at` | datetime | ◯ | 更新日時 |

**aliases例**：
- 正式名「カーコンビニ倶楽部 上尾店」
- aliases「上尾, 上尾店, カーコン上尾, 上尾カーコン」

**運用責任**：aliasesは新店舗追加時に本部担当者が登録する。**Phase 2でaliases整備フローを業務オペレーションに組み込む**。

### 5.4 Campaigns シート

本部施策マスタ。

| カラム | 型 | 必須 | 説明 |
|---|---|:-:|---|
| `campaign_id` | string | ◯ | 施策ID（例：C202605001） |
| `campaign_name` | string | ◯ | 施策名 |
| `description` | string | | 施策説明 |
| `target_business_type` | string | | 対象業態 |
| `target_area` | string | | 対象エリア |
| `target_store_ids` | string | | 個別対象店舗ID（カンマ区切り） |
| `owner_employee_id` | string | ◯ | 本部担当者 |
| `default_assignee_type` | string | ◯ | 管轄SV / 指定担当者 |
| `default_assignee_id` | string | | 指定担当者 |
| `due_date` | date | | 期限 |
| `priority` | string | | 高 / 中 / 低 |
| `rollout_status` | string | ◯ | 未展開 / 展開中 / 展開済 / 失敗 |
| `rollout_executed_at` | datetime | | 展開日時 |
| `created_by` | string | ◯ | 作成者employee_id |
| `created_at` | datetime | ◯ | 作成日時 |
| `updated_at` | datetime | ◯ | 更新日時 |

`rollout_status`により二重展開を防止する。

### 5.5 Tasks シート

店舗別タスクの**現在状態**を管理する。

| カラム | 型 | 必須 | 説明 |
|---|---|:-:|---|
| `task_id` | string (UUID) | ◯ | タスクID。**UUID推奨** |
| `campaign_id` | string | ◯ | 施策ID（FK） |
| `store_id` | string | ◯ | 店舗ID（FK） |
| `assigned_employee_id` | string | ◯ | 実行担当者（FK） |
| `status` | string | ◯ | 未着手 / 対応中 / 完了 / 保留 / 要確認 |
| `latest_memo` | string | | 最新メモ |
| `latest_event_id` | string | | 最新イベントID |
| `due_date` | date | | 期限 |
| `priority` | string | | 高 / 中 / 低 |
| `created_by` | string | ◯ | 作成者 |
| `created_at` | datetime | ◯ | 作成日時 |
| `updated_by` | string | | 最終更新者 |
| `updated_at` | datetime | ◯ | 最終更新日時 |
| `active` | boolean | ◯ | 有効フラグ |

**重複防止**：同一 `campaign_id` × `store_id` のタスクは2件作らない（自動展開時にチェック）。

**ステータス定義**：

| ステータス | 意味 |
|---|---|
| 未着手 | まだ対応していない |
| 対応中 | 対応を始めたが完了していない |
| 完了 | 指示内容を完了した |
| 保留 | 店舗都合・本部確認待ち等 |
| 要確認 | AI判定が曖昧、または人間確認が必要 |

### 5.6 TaskEvents シート

タスク更新履歴を**追記型**で管理する。監査・トラブル対応・AI精度改善に必須。

| カラム | 型 | 必須 | 説明 |
|---|---|:-:|---|
| `event_id` | string (UUID) | ◯ | イベントID |
| `task_id` | string | ◯ | タスクID（FK） |
| `actor_employee_id` | string | ◯ | 操作者 |
| `event_type` | string | ◯ | created / status_changed / memo_added / ai_update / manual_update |
| `status_before` | string | | 更新前ステータス |
| `status_after` | string | | 更新後ステータス |
| `memo` | string | | メモ |
| `raw_input` | string | | SVの元入力テキスト |
| `ai_json` | string | | AIの構造化結果（JSON文字列） |
| `ai_confidence` | number | | AI信頼度 |
| `request_id` | string | ◯ | 二重送信防止ID |
| `source` | string | ◯ | web / mobile / gas / import |
| `created_at` | datetime | ◯ | 作成日時 |

**TaskEventsは削除・編集禁止**。GAS側で書き込み専用にする。

### 5.7 ErrorLogs シート（Phase 1.5から）

Phase 1では `Logger.log()`（GASのStackdriver Logs）で代替し、Phase 1.5でシート化する。

| カラム | 型 | 必須 | 説明 |
|---|---|:-:|---|
| `error_id` | string | ◯ | エラーID |
| `request_id` | string | | 対象リクエストID |
| `source` | string | ◯ | nextjs / gas / gemini / sheets |
| `error_type` | string | ◯ | validation_error / auth_error / ai_error / sheet_error |
| `message` | string | ◯ | エラーメッセージ |
| `payload` | string | | 関連payload |
| `created_at` | datetime | ◯ | 発生日時 |

---

## 6. AI連携設計

### 6.1 AIの役割と非役割

**AIに期待すること**：
- 店舗名らしき表現の抽出
- 施策名らしき表現の抽出
- ステータスの推定（完了 / 保留 / 対応中など）
- メモの整形
- 追加アクションの示唆

**AIに任せないこと**：
- DBの直接更新
- `task_id` の確定
- 権限の判断
- 曖昧な入力の勝手な解決
- マスタにない店舗名・施策名の補完（ハルシネーション）

**マスタ突合は決定論処理**：AIが抽出した文字列を、サーバ側の `taskMatcher` 関数が aliases 含めて照合する。これは譲れない。

### 6.2 構造化JSONスキーマ

Gemini APIには **必ず `responseMimeType: "application/json"` と `responseSchema` を指定**する。

```json
{
  "intent": "update_task_status",
  "store_mentions": ["上尾店"],
  "campaign_mentions": ["秋キャンペーン"],
  "status": "完了",
  "memo": "店長に確認済み。販促物は来週到着予定なら問題ないとのこと。",
  "next_action": "なし",
  "needs_follow_up": false,
  "confidence": 0.86,
  "ambiguity_reason": ""
}
```

**intent列挙**：`update_task_status` / `add_memo` / `ask_question` / `create_issue` / `unknown`
**status列挙**：`未着手` / `対応中` / `完了` / `保留` / `要確認`

### 6.3 confidence閾値

| confidence | 処理 |
|---|---|
| 0.90以上 | 確認画面を簡略表示（対象・ステータスのみ） |
| 0.70〜0.89 | 通常確認画面（編集可能） |
| 0.50〜0.69 | 候補選択画面（複数候補を提示） |
| 0.50未満 | 自動判定せず手動選択画面へ |

**Phase 1では、いかなるconfidenceでも自動更新はしない**。必ず確認画面を経由する。

### 6.4 安全策5点

| # | リスク | 対策 |
|---|---|---|
| 1 | プロンプトインジェクション | システムプロンプトとユーザー入力を分離。`status` はenum制約。一括更新禁止。`task_id` をAIに生成させない |
| 2 | ハルシネーション | 店舗・施策の確定はマスタ照合のみ。AIが出した名称がマスタにない場合は更新しない |
| 3 | 誤更新（似た店舗名） | `aliases` 列、類似候補複数表示、一意でなければ自動更新しない |
| 4 | 二重送信 | `request_id` をNext.js側で生成、TaskEventsで重複チェック |
| 5 | 通信エラー | Phase 1: 送信失敗時の再試行ボタン。Phase 1.5: localStorage 下書き保存 |

---

## 7. 画面設計

### 7.1 Phase 1の最小画面（5画面）

1. **SVホーム**：未完了タスク数、期限切れ件数、報告ボタン
2. **タスク一覧**：自分の未完了タスク（店舗別・施策別フィルタ）
3. **自然言語報告画面**：テキスト入力 + 送信
4. **AI判定確認画面**：対象店舗・施策・新ステータス・confidence表示・承認ボタン
5. **タスク詳細**：現在状態、履歴、手動修正

### 7.2 Phase 2追加画面

- 本部向け施策登録画面（Campaignsシート直編集の代替）
- 本部向け進捗ダッシュボード
- 店舗名候補選択画面（曖昧時）
- 期限切れ通知

### 7.3 UI方針

- スマホ最優先（片手操作前提）
- 大きなボタン
- 検索よりも絞り込み
- 未完了だけ初期表示
- 「監視」ではなく「支援」UI（個人別未完了ランキング等は作らない）

---

## 8. GAS / API設計

### 8.1 GASの責務

- doPost受信
- 認証検証（Phase 1: 共有シークレット、Phase 1.5: HMAC + timestamp）
- payloadバリデーション
- LockServiceによる排他制御
- Tasks更新
- TaskEvents追記
- 成功/失敗レスポンス返却

**GASに業務ロジックを詰め込まない**。Supabase移行時に書き直す範囲を最小化する。

### 8.2 doPostペイロード例

```json
{
  "request_id": "req_20260523_xxxxx",
  "actor_employee_id": "E0001",
  "task_id": "uuid-v4-string",
  "status_after": "完了",
  "memo": "店長に確認済み。販促物は来週到着で問題なし。",
  "raw_input": "上尾店、秋キャンペーン確認済み。販促物は来週でOK。完了。",
  "ai_json": { ... },
  "source": "web"
}
```

### 8.3 認証

**Phase 1**：HTTPヘッダに共有シークレットを含め、GAS側で文字列比較。
```
X-App-Secret: (環境変数)
```

**Phase 1.5**：HMAC-SHA256署名 + タイムスタンプ検証。
```
X-App-Timestamp: 2026-05-23T10:00:00+09:00
X-App-Signature: hmac_sha256(payload + timestamp, secret)
```
- タイムスタンプが5分以上古い場合は拒否
- 署名不一致は拒否
- 拒否時はErrorLogsへ記録

### 8.4 排他制御

GASでは `LockService.getScriptLock().waitLock(10000)` で全書き込みをラップする。

処理順序：
1. Lock取得
2. `request_id` 重複チェック（既存ならスキップして既存結果を返す）
3. `task_id` 存在チェック
4. 現在ステータス取得
5. Tasks更新
6. TaskEvents追記
7. Lock解放

### 8.5 冪等性

同一 `request_id` がTaskEventsに既存の場合、二重処理せず既存処理結果を返す。通信エラー時の再送・ボタン連打による二重更新を防ぐ。

---

## 9. タスク自動展開設計

### 9.1 展開処理（Phase 2で本実装）

入力：`campaign_id`、`target_business_type`、`target_area`、`target_store_ids`、`default_assignee_type`、`due_date`

処理：
1. Campaignsから対象施策を取得
2. `rollout_status != "展開済"` であることを確認
3. Storesから対象店舗を抽出
4. 店舗ごとに `assigned_employee_id` を決定
5. 既存Tasksに同一 `campaign_id + store_id` がないか確認
6. Tasksへ一括追加（LockService内）
7. TaskEventsへ created イベントを追加
8. Campaignsの `rollout_status` を「展開済」に更新

### 9.2 onEditではなく明示実行にする

理由：onEdit は入力途中・修正時・誤入力時に発火するため、誤展開リスクが高い。以下のいずれかで明示的に実行する。

- GASカスタムメニュー「選択中の施策を展開」
- Campaignsシートに「展開実行」チェック列を設け、TRUEで実行
- 管理画面の展開ボタン（Phase 2）

**Phase 1ではGAS Apps Scriptエディタからの手動関数実行で十分**。

### 9.3 失敗時の扱い

部分的にTasksが作成された状態で失敗した場合、`rollout_status="失敗"` をセット。**冪等再実行を可能にするため、再度展開ボタンを押せば残り店舗だけタスクが作られる**（既存タスクは作り直さない）。Phase 2で明示的なリトライUI。

---

## 10. 認証・権限設計

### 10.1 認証方式

**Phase 1**：メールアドレス入力 + 固定PIN（または URLクエリで `employee_id` を渡す簡易方式）
- 実装が軽い
- セキュリティは弱い
- 3〜5人のPoC向けに限定

**Phase 1.5以降**：Googleログイン（NextAuth.js、ドメイン制限）
- 全社展開を見据えるならこちら必須

### 10.2 権限ロール

| role | 権限 |
|---|---|
| SV | 自分のタスク閲覧・更新 |
| Manager | 部下SVのタスク閲覧 |
| HQ | 施策登録・進捗閲覧 |
| Admin | 全機能 |

### 10.3 「鏡張り運用」について

Phase 1〜2では「タスク進捗が全員に見える」運用を許容する（ユーザー前提）。ただし以下に注意。

- 個人別未完了ランキングのような表示は作らない
- 「支援」「抜け漏れ防止」「優先順位整理」を前面に
- SV別表示は管理者向けに限定

**Phase 2の終わりに鏡張り運用の継続可否を再評価する**。人数増加と組織内政治の関係を見極める。

---

## 11. ログ・監査設計

### 11.1 TaskEventsの位置付け

TaskEventsは単なる履歴ではなく、**監査・トラブル対応・AI精度改善の基盤データ**である。以下を全イベントで残す。

- 誰が（actor_employee_id）
- いつ（created_at）
- 何を（status_before → status_after）
- どの入力から（raw_input）
- AIがどう解釈して（ai_json + ai_confidence）
- どの経路で（source）
- どのリクエストで（request_id）

### 11.2 監査の活用

- AI精度の継続評価（confidence vs 実際の正答率）
- 誤更新発生時のロールバック判断
- 「いつ・なぜそうなったか」の事後追跡

### 11.3 ErrorLogs（Phase 1.5以降）

- GAS処理エラー
- Gemini API失敗
- 認証拒否
- バリデーションエラー

Phase 1では `Logger.log()` で代替。Phase 1.5でシート化。

---

## 12. リスク一覧

| リスク | 影響 | 発生可能性 | 対策 |
|---|---|:-:|---|
| AI誤更新 | 誤ったタスク完了 | 中 | 確認画面、aliases照合、ログ保存 |
| 店舗名揺れ | 別店舗更新 | 高 | store_id、aliases、候補選択 |
| GAS同時書き込み競合 | 更新欠落 | 中 | LockService、request_id |
| Sheets肥大化 | 表示遅延 | 中 | Archive、Supabase移行基準 |
| 本部の投げっぱなし | 現場負担増 | 高 | 施策オーナー明記、期限、進捗責任 |
| 監視ツール化 | 現場反発 | 中 | 支援UI、個人ランキング回避 |
| PoC止まり | 定着しない | 中 | 3SVで実運用、KPI測定 |
| 権限不備 | 情報漏洩 | 低〜中 | Googleログイン（Phase 1.5）、ロール |
| 二重展開 | タスク重複 | 中 | rollout_status、重複チェック |
| 移行困難 | 技術的負債 | 中 | ID設計、RDB風シート、API契約層 |
| Phase 1スコープ過積載 | 開発停滞 | **高** | **本計画のフェーズ分割** |
| 音声入力精度不足 | 入力体験悪化 | 中 | Phase 1ではテキスト中心、音声は1.5で検証 |
| オフライン時の入力消失 | 報告体験悪化 | 中 | Phase 1で再試行ボタン、1.5でlocalStorage下書き |
| aliases整備の運用穴 | AI精度劣化 | 中 | Phase 2で本部の整備フロー組込 |

---

## 13. 開発ロードマップ

### 13.1 Phase 1 — 最小PoC（2〜3週間・1人開発・自己検証 + 1SV）

**目的**：「1件のタスク更新が安全に動く」「現場が触れる」を証明する。

**スコープ**：
- 5シート作成（Employees / Stores（aliases入り） / Campaigns / Tasks / TaskEvents）
- Sheets所有者を運用専用Googleアカウントに移管
- GAS Web App（共有シークレット + LockService）
- Next.js 5画面（SVホーム / タスク一覧 / 報告 / AI判定確認 / タスク詳細）
- Next.js API Route 契約層
- Gemini Structured Output（responseSchema指定）
- taskMatcher（aliases含めた決定論照合）
- 確認画面必須化
- TaskEvents追記
- 認証は簡易PIN or URLクエリ
- タスク自動展開はGASエディタから手動関数実行

**やらないこと**：
- HMAC署名
- ErrorLogsシート
- Googleログイン
- 音声入力
- 施策展開UI
- 本部進捗ダッシュボード
- オフライン下書き

**ゴール**：「3SVに見せて『これなら使えそう』と言わせる」

### 13.2 Phase 1.5 — 補強（2〜3週間・1SV → 3SV試験運用）

- HMAC + timestamp 認証へ昇格
- ErrorLogsシート化
- Googleログイン導入
- localStorage下書き保存（オフライン耐性）
- 音声入力試験投入（精度を見て判断）
- 施策の手動JSON展開ツール（GASカスタムメニュー）
- データ修正運用フロー確立

**ゴール**：「3SVが2週間使い続けて脱落しない」

### 13.3 Phase 2 — 小規模実運用（1〜3か月・3SV安定運用、対象範囲拡大）

- 施策の自動展開UI（Campaignsシート + GASバッチ → Web UI）
- 本部向け進捗ダッシュボード
- 店舗名候補選択UI（曖昧時）
- 期限切れ通知（Google Chat or メール）
- Archive処理（完了タスクの定期移送）
- Looker Studio連携
- aliases整備の業務フロー組込
- 教育コンテンツ整備
- 鏡張り運用の継続可否再評価

**ゴール**：「1施策あたりの本部個別フォロー回数が半減」

### 13.4 Phase 3 — 全社展開・本番基盤化（3〜6か月・Supabase移行）

**移行判断トリガー**（いずれかを満たしたら検討開始）：
- 利用SVが10名以上
- 月間タスク5,000件以上
- TaskEventsが10万行に近づく
- GAS処理遅延が顕在化
- 権限制御が複雑化

**実施項目**：
- Supabase / PostgreSQL移行
- Supabase Auth（Google OAuth）
- Row Level Security（RLS）導入
- API Route契約層の中身をSupabaseクライアントに差し替え（**フロントエンドは無変更**）
- 本格管理画面
- Salesforce連携検討

**ゴール**：「全SV20名規模で月10,000イベントを安定処理」

---

## 14. Phase 1の着手タスクリスト（明日から1人で着手する用）

### Day 1〜2：基盤準備
- [ ] 運用専用Googleアカウントを作成
- [ ] Spreadsheetを新規作成し、所有者を運用アカウントに
- [ ] 5シート（Employees / Stores / Campaigns / Tasks / TaskEvents）を作成
- [ ] サンプルデータ投入（社員3名、店舗5〜10店舗、施策2件、タスク10件）
- [ ] Vercelプロジェクト作成、Next.jsスケルトン生成
- [ ] Gemini API キー取得

### Day 3〜5：GAS層
- [ ] GAS Web App作成、doPost実装
- [ ] 共有シークレット検証
- [ ] LockService組込
- [ ] Tasks更新関数、TaskEvents追記関数
- [ ] 動作確認（curl で叩く）

### Day 6〜10：Next.js UI層
- [ ] ログイン画面（簡易PIN or URLクエリ）
- [ ] SVホーム
- [ ] タスク一覧
- [ ] 自然言語報告画面
- [ ] Gemini API呼び出し（responseSchema指定）
- [ ] taskMatcher実装（aliases照合含む）
- [ ] AI判定確認画面
- [ ] API Route から GAS への送信
- [ ] エンドツーエンド疎通

### Day 11〜14：磨き込み・自己検証
- [ ] 自分でダミーSVとして10件以上更新してみる
- [ ] エラーケース確認（重複送信、不正payload、AI低confidence）
- [ ] 確認画面のUX調整
- [ ] スマホ実機検証
- [ ] 3SVへのデモ準備

---

## 15. 成功指標（KPI）

### Phase 1
- SVが1週間に10件以上タスク更新する
- 1更新あたりの入力時間が30秒以内
- 誤更新（別店舗・別施策への更新）が3SV合計で月3件以下
- 確認画面のスキップ率（読まずに承認）が監視可能

### Phase 2
- 対象SVの週次利用率70%以上
- 本部施策の未対応店舗が即時把握できる
- 個別フォロー連絡回数が施策あたり半減
- 入力漏れ・報告漏れが目視で減ったとSVが回答する

### Phase 3
- 全SV利用率80%以上
- AI判定精度（実際の正答率）90%以上
- 月間ダウンタイム1時間以内

---

## 16. Supabase移行設計

### 16.1 移行時に変えない（=Phase 1から固定する）

- `employee_id` / `store_id` / `campaign_id` / `task_id`（UUID）/ `event_id`
- status 列挙値
- event_type 列挙値
- `created_at` / `updated_at` 形式
- TaskEvents のスキーマ

### 16.2 移行時に変える

| 項目 | 移行前 | 移行後 |
|---|---|---|
| データ保存先 | Sheets | Supabase（PostgreSQL） |
| API | GAS Web App | Supabase API / Next.js API Route 内 |
| 認証 | Googleログイン | Supabase Auth |
| 権限制御 | アプリ側 | RLS |
| ダッシュボード | Sheets / Looker | 専用Web管理画面 |

### 16.3 移行手順

1. Supabaseにテーブル作成（5〜6テーブル）
2. SheetsからCSVエクスポート
3. 順序：employees → stores → campaigns → tasks → task_events
4. 外部キー整合性チェック
5. **Next.js API Routeの中身をSupabaseクライアントに差し替え**（フロントエンドは無変更）
6. 並行稼働期間（1〜2週間）
7. Sheetsをバックアップ用に降格

**API Route契約層を最初から挟んでいる効果がここで効く**。フロントエンドのコードは1行も変えない。

---

## 17. 社内説明メッセージ

### 17.1 経営層向け

> FC本部の施策は、最後はSVが店舗に落とし込むことで初めて成果になります。本システムは、そのラストワンマイルを可視化し、施策の実行率を高めるための基盤です。本部の指示伝達コストとSVの認知負荷を同時に下げ、結果として本部施策の浸透速度を上げます。月額コストはGoogle Workspace基本料金内で、まず3SVで3週間で価値を証明します。

### 17.2 上司向け

> 本部からの施策指示を、SV個人の記憶力に頼らず、店舗別タスクとして自動展開・進捗管理できる仕組みです。現場SVはスマホから自然文で報告できるため、入力負荷を増やさずに本部施策の実行状況を可視化できます。スプレッドシートとGoogle Apps Scriptで始めるので追加コストゼロ、将来データ量が増えたらSupabaseに無痛で移行できる設計にしてあります。

### 17.3 現場SV向け

> 本部から来た細かい確認事項を、自分で覚えて管理しなくてよくするための仕組みです。スマホで自分の未完了タスクを見て、終わったら一言入れるだけで報告できます。Excelやスプレッドシートを開いて項目を埋める作業はなくなります。

---

## 18. 最終結論

| 項目 | 結論 |
|---|---|
| 今すぐ採用する方針 | Next.js + Gemini + GAS + Sheets（5シート、aliases付き）、API Route契約層、AI判定確認画面必須、LockService、task_id UUID、Sheets所有者を運用アカウントに |
| 今は避ける方針 | AI完全自動更新、最初からSupabase課金、Phase 1で全機能実装、4週間で全社展開、認証なしWeb App公開 |
| 後で再検討する方針 | Supabase移行タイミング、音声入力エンジン、鏡張り運用継続可否、Salesforce連携深度 |
| 最大リスク | Phase 1スコープ過積載による開発停滞 |
| 最初に作るべき画面 | SV向けタスク消込画面（一覧 → 報告 → AI判定確認 → 承認） |
| 最初に作るべきデータ構造 | 5シート（Employees / Stores（aliases）/ Campaigns / Tasks / TaskEvents）、全リレーションID、結合セル禁止 |

---

## 付録A. 型定義（TypeScript）

```typescript
type TaskStatus = '未着手' | '対応中' | '完了' | '保留' | '要確認';
type Role = 'SV' | 'Manager' | 'HQ' | 'Admin';
type EventType = 'created' | 'status_changed' | 'memo_added' | 'ai_update' | 'manual_update';

type Task = {
  taskId: string;            // UUID
  campaignId: string;
  campaignName: string;      // 表示用（DBには持たない、JOIN結果）
  storeId: string;
  storeName: string;         // 表示用
  assignedEmployeeId: string;
  status: TaskStatus;
  latestMemo?: string;
  dueDate?: string;          // ISO 8601
  priority?: '高' | '中' | '低';
  updatedAt: string;
};

type AiParsedReport = {
  intent: 'update_task_status' | 'add_memo' | 'ask_question' | 'create_issue' | 'unknown';
  storeMentions: string[];
  campaignMentions: string[];
  status?: TaskStatus;
  memo?: string;
  nextAction?: string;
  needsFollowUp: boolean;
  confidence: number;        // 0.0 - 1.0
  ambiguityReason?: string;
};

type TaskMatchResult = {
  matchType: 'single' | 'multiple' | 'none';
  candidates: Task[];
  reason: string;
};

type UpdateRequest = {
  requestId: string;         // クライアント生成UUID
  actorEmployeeId: string;
  taskId: string;
  statusAfter: TaskStatus;
  memo?: string;
  rawInput: string;
  aiJson: AiParsedReport;
  source: 'web' | 'mobile';
};
```

## 付録B. ディレクトリ構成

```
src/
  app/
    page.tsx                       # SVホーム
    tasks/page.tsx                 # タスク一覧
    tasks/[taskId]/page.tsx        # タスク詳細
    report/page.tsx                # 自然言語報告
    report/confirm/page.tsx        # AI判定確認
  api/
    parse-report/route.ts          # Gemini呼び出し + taskMatcher
    submit-task-update/route.ts    # GASへ送信（契約層）
  components/
    TaskCard.tsx
    TaskList.tsx
    VoiceInput.tsx                 # Phase 1.5
    AiResultConfirm.tsx
    StatusBadge.tsx
  lib/
    gemini.ts                      # responseSchema定義含む
    gasClient.ts                   # HMAC署名（Phase 1.5）含む
    taskMatcher.ts                 # aliases照合
    auth.ts
    types.ts
gas/
  Main.gs                          # doPost
  Auth.gs                          # 共有シークレット/HMAC検証
  TasksRepo.gs                     # Tasks/TaskEvents操作
  Lock.gs                          # LockService wrapper
```

## 付録C. 用語集

| 用語 | 定義 |
|---|---|
| SV | スーパーバイザー。担当エリアの加盟店を巡回する本部社員 |
| 施策（Campaign） | 本部から発出される指示・キャンペーン・確認事項の単位 |
| タスク（Task） | 施策×店舗の組み合わせで生成される実行単位 |
| 自動展開 | 施策マスタの登録を起点に対象店舗分のタスクを生成する処理 |
| ラストワンマイル | 本部施策が個別店舗に届く最終区間。SVが担う |
| 鏡張り | 全員のタスク進捗が全員に見える運用形態 |
| 契約層 | Next.js API Route。Supabase移行時の差し替え点 |
| 確認画面 | AI判定結果をSVが承認する画面。Phase 1では必須経由 |

---

**版数管理**

| 版 | 日付 | 主な変更 |
|---|---|---|
| v1.0 | 2026-05-23 | 初版。レビュー委員会判定を反映 |
