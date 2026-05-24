# AI開発エージェント指示テンプレ集

> 計画書 (`docs/SV業務DX化_計画書_v1.0.md`) を Cursor / Claude Code 等の AI 開発エージェントに渡して Phase 1 を実装させる際の指示テンプレート集。

---

## このファイルの使い方

| 用途 | 使うテンプレ | 頻度 |
|---|---|:-:|
| プロジェクト開始時の最初の1投目 | §1 Day 1 キックオフ | 1回 |
| プロジェクト常駐ルール | §2 CLAUDE.md / .cursorrules | 配置1回、自動参照 |
| Phase 1 内の個別タスク | §3 タスク単位テンプレ | 毎タスク |
| 行き詰まったとき | §4 リカバリプロンプト | 必要時 |

**配置例**：
```
~/Dev/product/sv-dx-platform/
├── CLAUDE.md           ← §2 をここに（Claude Code が自動参照）
├── .cursorrules        ← §2 のサブセットをここに（Cursor が自動参照）
├── docs/
│   ├── SV業務DX化_計画書_v1.0.md
│   └── AI開発エージェント_指示テンプレ.md  ← このファイル
└── ...
```

---

## §1. Day 1 キックオフプロンプト

プロジェクト開始時の最初の1投目。**プロジェクトディレクトリ直下で、計画書とこのファイルを置いた状態で投げる**。

```text
このプロジェクトは「自動車整備板金フランチャイズ本部のSV業務DX化基盤」の Phase 1 実装です。
作業ディレクトリ：~/Dev/product/sv-dx-platform/ （プレースホルダ、適宜変更）

## 最初にやってほしいこと（実装には入らない）

1. `docs/SV業務DX化_計画書_v1.0.md` を最初から最後まで読んでください
2. 読み終わったら以下を整理して提示してください：
   a) Phase 1 で実装するもの（計画書 §13.1 と §14 から）
   b) 絶対に守る設計原則（計画書 §3 「非交渉事項」から8項目）
   c) Phase 1 で**実装しないもの**（計画書 §13.2 〜 §13.4 のもの全部）
3. (a) を Day 1 〜 Day 14 の粒度で、5〜10個のサブタスクに分解した実装プランを提示してください
4. 私の承認を待ってから初めて実装に入ってください

## 私の作業環境
- OS: macOS（適宜書き換え）
- 作業ディレクトリ: ~/Dev/product/sv-dx-platform/
- 使用経験あり: Vercel, Next.js, Gemini API, Supabase
- TypeScript 中級、GAS 初級
- 私は 1 人で開発します

## 重要な前提
- これは「明日 1 人で着手できる」ことを最優先した計画です
- 設計書は完成度が高いですが、Phase 1 ではそのうちの一部しか実装しません
- Phase 1 で何を実装し何を実装しないかは、計画書 §13.1 と §13.2 が唯一の判断基準です
- 「これも入れた方が便利」「ついでにこれもやっておくか」と感じたら、それは 99% スコープ外です。必ず先に質問してください

## あなたへの期待
- 計画書を解釈し、Phase 1 のスコープを厳守する
- 設計から逸脱する前に必ず質問する
- 大きな変更（ライブラリ追加、ディレクトリ再編、スキーマ変更）の前に方針を共有する
- 実装後に「何を実装したか」「計画書のどこに対応するか」を必ず報告する

## あなたがやってはいけないこと
- 計画書を読まずに実装を始める
- Phase 1.5 以降の機能を「ついでに」入れる（特に HMAC、Googleログイン、音声入力、ダッシュボード）
- 設計を「もっと良くなる」と思って勝手に変える
- 確認画面をスキップさせる便利機能を提案する
- AI に判断させる範囲を勝手に広げる
- ライブラリを勝手に追加する

それでは、まず計画書を読んで Phase 1 のサブタスク分解を提示してください。
```

---

## §2. CLAUDE.md / .cursorrules（プロジェクト常駐ルール）

プロジェクトルートに `CLAUDE.md`（Claude Code 用）または `.cursorrules`（Cursor 用）として配置。AI が毎回自動で読み込むので、**繰り返し言わなくても済む内容**を入れる。

```markdown
# プロジェクト：SV業務DX化基盤 Phase 1

## このプロジェクトについて
自動車整備板金フランチャイズ本部の SV（スーパーバイザー）業務 DX 化基盤。
本部からの施策指示を店舗別タスクとして自動展開し、SV がスマホから自然言語で消し込める。
詳細：`docs/SV業務DX化_計画書_v1.0.md`

## 唯一の設計ソース
**`docs/SV業務DX化_計画書_v1.0.md`**
- すべての設計判断はこのドキュメントに従う
- 設計書と矛盾するコードは書かない
- 不明点があれば実装前に質問する
- 計画書を引用するときは §番号 を明示する

## 非交渉事項（絶対に守る、計画書 §3）

1. **task_id は UUID v4**。Sheets 上では文字列として保持
2. **すべてのリレーションは ID ベース**（employee_id, store_id, campaign_id, task_id, event_id）。name や email を JOIN キーにしない
3. **AI による更新の前には必ず確認画面を経由する**。confidence がどれだけ高くても自動更新ゼロ
4. **Next.js API Route を契約層として挟む**（フロント → API Route → GAS の二段構成）。フロントから GAS を直接叩かない
5. **GAS のすべての書き込みは LockService でラップする**（waitLock 10秒）
6. **店舗・施策のマスタ照合は taskMatcher（サーバ側 TypeScript）で決定論的に行う**。AI に確定させない
7. **Gemini API は `responseMimeType: 'application/json'` + `responseSchema` で強制構造化**。自由テキストでの JSON 生成依頼は禁止
8. **TaskEvents は append-only**。削除・編集する関数を書かない。すべての変更はイベント追記で表現

## Phase 1 スコープ（これ以外は実装しない、計画書 §13.1）

実装する：
- 5 シート（Employees / Stores（aliases 付き）/ Campaigns / Tasks / TaskEvents）のスキーマ整備
- GAS Web App（共有シークレット + LockService + doPost + Tasks 更新 + TaskEvents 追記）
- Next.js 5 画面（SVホーム / タスク一覧 / 自然言語報告 / AI判定確認 / タスク詳細）
- Next.js API Route 契約層（`parse-report`, `submit-task-update`）
- Gemini Structured Output（responseSchema 必須）
- taskMatcher（aliases 含めた決定論照合）
- 確認画面必須化（自動更新ゼロ）
- 簡易認証（URL クエリで employee_id を渡す、または固定 PIN）
- request_id による冪等性

## Phase 1 で実装しないもの（やったら戻す、計画書 §13.2 〜 §13.4）

- HMAC + timestamp 認証 → Phase 1.5
- ErrorLogs シート化 → Phase 1.5（当面 `Logger.log()` で代替）
- Googleログイン → Phase 1.5
- 音声入力（Web Speech API / Gemini multimodal）→ Phase 1.5
- localStorage 下書き保存 → Phase 1.5
- 施策の自動展開 UI → Phase 2（当面 GAS エディタから関数手動実行）
- 本部進捗ダッシュボード → Phase 2
- 店舗名候補選択 UI → Phase 2
- 期限切れ通知（Chat / メール）→ Phase 2
- Archive 処理 → Phase 2
- Looker Studio 連携 → Phase 2
- Salesforce 連携 → Phase 3 検討
- Supabase 移行 → Phase 3
- RLS / Supabase Auth → Phase 3

## 技術スタック

- Frontend: Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- API 層: Next.js Route Handlers（`src/app/api/.../route.ts`）
- AI: Gemini API（`gemini-1.5-flash`、responseSchema 必須）
- Backend: Google Apps Script（`gas/` ディレクトリで管理、`clasp` でデプロイ）
- DB: Google Sheets（運用専用 Google アカウントが所有）
- 認証: 簡易方式（Phase 1）→ Googleログイン（Phase 1.5）

## ディレクトリ構成（固定）

```
~/Dev/product/sv-dx-platform/
├── docs/
│   ├── SV業務DX化_計画書_v1.0.md
│   └── AI開発エージェント_指示テンプレ.md
├── src/
│   ├── app/
│   │   ├── page.tsx                       # SVホーム
│   │   ├── tasks/page.tsx
│   │   ├── tasks/[taskId]/page.tsx
│   │   ├── report/page.tsx
│   │   ├── report/confirm/page.tsx
│   │   └── api/
│   │       ├── parse-report/route.ts      # Gemini + taskMatcher
│   │       └── submit-task-update/route.ts # GAS への送信
│   ├── components/
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   ├── AiResultConfirm.tsx
│   │   └── StatusBadge.tsx
│   └── lib/
│       ├── gemini.ts                      # responseSchema 定義含む
│       ├── gasClient.ts                   # GAS Web App 呼び出し
│       ├── taskMatcher.ts                 # aliases 照合
│       ├── auth.ts
│       └── types.ts
├── gas/
│   ├── Main.gs                            # doPost
│   ├── Auth.gs                            # 共有シークレット検証
│   ├── TasksRepo.gs                       # Tasks / TaskEvents 操作
│   └── Lock.gs                            # LockService wrapper
├── .env.local                             # gitignore 必須
├── .env.example                           # コミット可（キー名のみ）
├── .gitignore
├── CLAUDE.md
└── package.json
```

## コーディングルール

- TypeScript 必須（`any` 禁止、`unknown` は OK）
- すべての型定義は `src/lib/types.ts` に集約
- API Route は `zod` でリクエスト/レスポンスを必ずバリデーション
- 環境変数（GAS URL、Gemini API キー、共有シークレット、Spreadsheet ID）は `.env.local` のみ。コミット禁止
- 関数名は動詞始まり、ファイル名は kebab-case（Next.js コンポーネントは PascalCase）
- 1 関数 50 行以内目安、超えたら分割を提案

## 質問してから動くべきケース

以下のいずれかに該当したら、コードを書く前に必ず質問する：
- 計画書に書いていない判断が必要なとき
- 計画書の指示と現実が矛盾するとき
- 「これは便利だから入れた方が...」と感じたとき（ほぼ 100% スコープ外）
- 大規模なリファクタリングをしたくなったとき
- ライブラリを新たに追加したいとき
- スキーマを変更したいとき
- AI に判断させる範囲を広げたいとき

## 報告フォーマット（実装後に必ず提出）

```
### 実装した内容
- [ファイル名] : [変更概要]

### 計画書のどこに対応するか
- §X.Y の zzz

### 動作確認方法
- [手順]

### 次のステップ案
- [候補1]
- [候補2]

### 不明点 / 質問
- [あれば]
```

## やってはいけない言動

- 計画書を読まずに実装する
- Phase 1.5 以降の機能を「ついでに」入れる
- 設計を「もっと良くなる」と思って勝手に変える
- ライブラリを勝手に追加する（特に状態管理、UI ライブラリ、認証ライブラリ）
- DB スキーマを勝手に変える
- API のレスポンス形式を勝手に変える
- 確認画面をスキップさせる「便利機能」を提案する
- AI に判断させる範囲を勝手に広げる
- 「これは TODO ですよね」と勝手に判断してプレースホルダーを大量に置く
```

---

## §3. タスク単位プロンプトテンプレ

Phase 1 内の個別ステップ（Day 3〜5 の GAS 層実装、Day 6〜10 の Next.js UI 層実装など）を進めるとき。**毎タスクこれを 1 投目として使う**。

```text
## タスク
[1行で実装したい機能を書く。例：GAS Web App の doPost と submit-task-update API Route の疎通]

## 計画書の参照箇所
- §[番号]（例：§8.2 doPost ペイロード、§8.3 認証、§8.4 排他制御）

## 今のステップでの目的
[Day X / Step Y の文脈。例：Day 3-5 GAS 層の最小実装。共有シークレット認証で動作確認まで]

## 期待する成果物
- `gas/Main.gs` : doPost ハンドラ
- `gas/Auth.gs` : 共有シークレット検証
- `gas/TasksRepo.gs` : Tasks 更新 + TaskEvents 追記
- `gas/Lock.gs` : LockService wrapper
- `src/app/api/submit-task-update/route.ts` : フロントからの呼び出し受け
- `src/lib/gasClient.ts` : GAS Web App URL を叩くクライアント

## 前提
- 既に動く状態：[前のステップで作ったもの]
- まだない：[作っていないもの]
- スプレッドシート ID は `.env.local` の `SHEET_ID` に入っている
- 共有シークレットは `.env.local` の `GAS_SHARED_SECRET` に入っている

## 非交渉事項の中で今回特に注意する点
- LockService.getScriptLock().waitLock(10000) で全書き込みをラップ
- request_id 重複チェック → 既存ならスキップして既存結果を返す
- TaskEvents は append-only、編集関数を作らない
- フロントから GAS を直接叩かず、必ず API Route 経由

## 動作確認方法
- [手順例：curl で API Route を叩く、Spreadsheet に行が追加されることを確認、同 request_id で 2 回叩いて 1 行しか増えないことを確認]

## 進め方
まず実装プランを箇条書きで提示してください（コードはまだ書かない）。
私が承認したら、ファイル単位で実装してください。
ファイル 1 つできたら、私に確認させてから次に進んでください。

不明点があればこのターンで質問してください。
```

---

## §4. リカバリプロンプト（行き詰まったとき）

実装が混乱したとき、エージェントが暴走しはじめたとき、Phase 1 スコープから外れ始めたときの「リセット」用プロンプト。

```text
いったん止まってください。

## 状況確認
1. 今あなたは何を実装している最中ですか？
2. それは計画書（`docs/SV業務DX化_計画書_v1.0.md`）の §どこに対応しますか？
3. それは Phase 1 のスコープ（計画書 §13.1）に含まれていますか？
4. 含まれていない場合、なぜ実装に入りましたか？

## やってほしいこと
- 上記 1〜4 に答える
- Phase 1 スコープ外のコードを書いた場合、それを差し戻す案を出す
- 直近 3 ターンで非交渉事項（CLAUDE.md の 8 項目）に違反したものがあれば指摘する
- これまでの実装状況を Phase 1 のサブタスクリストに沿って棚卸しする

実装は再開しないでください。私が承認するまで止めてください。
```

---

## §5. プロンプト運用 Tips

### 5-1. 「計画書を読み直して」と定期的に言う
AI は長いセッション中に最初に読んだドキュメントを忘れる傾向があります。
20〜30 ターンに 1 回は `「いま再度、docs/SV業務DX化_計画書_v1.0.md §3 と §13.1 を確認してください」` を入れる。

### 5-2. ファイル単位で進める
「タスク一覧ページを作って」ではなく「`src/app/tasks/page.tsx` を作って」と指定する。
範囲を狭くすると暴走しません。

### 5-3. テストデータを最初に作らせる
Phase 1 のあるべき進み方は「サンプル 5 店舗 + 2 施策 + 10 タスクで動く」を最初に作ること。
本物のデータを入れるのは Phase 1 末。先にダミーで E2E 疎通する。

### 5-4. 「ライブラリ追加してもいい？」と聞かれたら一旦疑う
Phase 1 で追加が許されるライブラリは事実上 `zod`, `uuid`, `@google/generative-ai`（または `@google-ai/generativelanguage`）程度。
状態管理ライブラリ、認証ライブラリ、UI コンポーネントライブラリは Phase 1 では不要。
「素の React + Next.js + Tailwind で書ける」と返してください。

### 5-5. GAS のローカル管理に `clasp` を使う
`gas/` ディレクトリは Google Apps Script に紐づけて `clasp push` でデプロイする運用にすると、GitHub にコード履歴が残せます。
これは Phase 1 のうちにやっておくと後で楽。

### 5-6. AI に「自信度」を聞く
不安な実装には `「この実装、計画書のどの記述を根拠にしましたか？他の解釈はありませんか？確信度は 10 段階でいくつですか？」` と聞く。
6 以下なら一緒に再検討する。

### 5-7. 「次の Day に進む前に確認」を挟む
Day 5 が終わったら必ず `「Day 5 までの実装内容を、計画書 §14 のチェックリストでセルフレビューしてください。チェックが付かない項目があれば挙げてください」` を投げる。

---

## §6. プロジェクト初期セットアップコマンド集

参考までに、Day 1 にエージェントへ実行を依頼するコマンド例。

```bash
# プロジェクト作成
cd ~/Dev/product
npx create-next-app@latest sv-dx-platform --typescript --tailwind --app --no-src-dir=false
cd sv-dx-platform

# 必要最小限の追加パッケージ
npm install zod uuid @google/generative-ai
npm install -D @types/uuid

# ディレクトリ整備
mkdir -p docs gas src/components src/lib

# 設計書を docs/ に配置
mv ~/Downloads/SV業務DX化_計画書_v1.0.md docs/
mv ~/Downloads/AI開発エージェント_指示テンプレ.md docs/

# 環境変数のテンプレート
cat > .env.example <<'EOF'
NEXT_PUBLIC_APP_NAME=SV業務DX化基盤
SHEET_ID=
GAS_WEB_APP_URL=
GAS_SHARED_SECRET=
GEMINI_API_KEY=
EOF

cp .env.example .env.local
# .env.local の中身は手動で埋める

# .gitignore に .env.local を追加
echo ".env.local" >> .gitignore

# clasp（GAS のローカル管理）
npm install -g @google/clasp
# clasp login は別途実行
```

---

## §7. 改版履歴

| 版 | 日付 | 内容 |
|---|---|---|
| v1.0 | 2026-05-23 | 初版 |
