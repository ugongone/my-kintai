# MyKintai 実装Todoリスト

## フェーズ1: プロジェクトセットアップ

### 1.1 Next.js プロジェクト初期化
- [ ] `npx create-next-app@latest` でプロジェクト作成
  - TypeScript: Yes
  - Tailwind CSS: Yes
  - App Router: Yes
  - src/ directory: Yes
- [ ] 不要なボイラープレート削除
- [ ] `.env.example` 作成

### 1.2 依存関係インストール
- [ ] `@supabase/supabase-js` インストール
- [ ] `@supabase/ssr` インストール
- [ ] `lucide-react` インストール

### 1.3 プロジェクト構成
- [ ] ディレクトリ構造作成
  - `src/components/`
  - `src/lib/`
  - `src/hooks/`
  - `src/types/`
- [ ] Tailwind CSS カスタム設定（配色）

---

## フェーズ2: Supabase セットアップ

### 2.1 Supabase プロジェクト作成
- [ ] Supabase ダッシュボードでプロジェクト作成
- [ ] プロジェクトURL・Anon Key 取得
- [ ] `.env.local` に環境変数設定

### 2.2 データベース構築
- [ ] `time_entries` テーブル作成
- [ ] `settings` テーブル作成
- [ ] インデックス作成
- [ ] RLSポリシー設定

### 2.3 Google OAuth 設定
- [ ] Google Cloud Console でOAuthクライアント作成
- [ ] Supabase で Google プロバイダー有効化
- [ ] リダイレクトURL設定

---

## フェーズ3: 認証機能実装

### 3.1 Supabase クライアント設定
- [ ] `src/lib/supabase/client.ts` 作成（ブラウザ用）
- [ ] `src/lib/supabase/server.ts` 作成（サーバー用）

### 3.2 認証ページ
- [ ] `src/app/login/page.tsx` 作成
  - Googleログインボタン
  - アプリロゴ・説明
- [ ] `src/app/auth/callback/route.ts` 作成

### 3.3 認証ミドルウェア
- [ ] `src/middleware.ts` 作成
  - 未認証ユーザーを `/login` へリダイレクト
  - セッション更新処理

### 3.4 認証フック
- [ ] `src/hooks/useAuth.ts` 作成
  - ユーザー情報取得
  - ログアウト処理

---

## フェーズ4: 共通レイアウト実装

### 4.1 ルートレイアウト
- [ ] `src/app/layout.tsx` 更新
  - フォント設定
  - メタデータ設定

### 4.2 サイドバー
- [ ] `src/components/layout/Sidebar.tsx` 作成
  - ロゴエリア（Briefcase アイコン + "MyKintai"）
  - メニューリスト（打刻・ホーム / 月次実績 / 設定）
  - ユーザープロファイル表示
  - ログアウトボタン
  - アクティブ状態のスタイリング

### 4.3 ヘッダー（モバイル用）
- [ ] `src/components/layout/Header.tsx` 作成
  - ハンバーガーメニューボタン
  - 通知アイコン

### 4.4 レスポンシブ対応
- [ ] モバイル用サイドバー（オーバーレイ形式）
- [ ] サイドバー開閉状態管理

---

## フェーズ5: ダッシュボード（打刻・ホーム）実装

### 5.1 ページ作成
- [ ] `src/app/page.tsx` 作成（ダッシュボード）

### 5.2 ステータスカード
- [ ] `src/components/dashboard/StatusCard.tsx` 作成
  - 現在時刻表示（リアルタイム更新）
  - 日付・曜日表示
  - ステータス表示（稼働外 / 稼働中 / 休憩中）
  - 打刻ボタン（状態に応じて表示切替）
    - 業務開始（Blue）
    - 休憩開始（Orange）/ 業務終了（Slate）
    - 休憩終了（Green）

### 5.3 手動打刻モーダル
- [ ] `src/components/ui/Modal.tsx` 作成
- [ ] `src/components/dashboard/ManualEntryModal.tsx` 作成
  - 日付選択
  - 時刻選択
  - 打刻種別選択
  - 備考入力

### 5.4 実績サマリーカード
- [ ] `src/components/dashboard/SummaryCard.tsx` 作成
  - 総稼働時間表示
  - 概算報酬額表示（時給 × 稼働時間）

### 5.5 直近の稼働テーブル
- [ ] `src/components/dashboard/RecentHistory.tsx` 作成
  - 直近3件の稼働表示
  - 「すべて見る」リンク

---

## フェーズ6: 打刻データ管理

### 6.1 型定義
- [ ] `src/types/database.ts` 作成
  - TimeEntry 型
  - Settings 型
  - EntryType 型（work_start, work_end, break_start, break_end）

### 6.2 打刻フック
- [ ] `src/hooks/useTimeEntries.ts` 作成
  - 今月の打刻一覧取得
  - 打刻登録
  - 打刻更新
  - 打刻削除

### 6.3 ステータス計算ロジック
- [ ] `src/lib/utils/workStatus.ts` 作成
  - 最新の打刻から現在のステータスを計算
  - 稼働時間計算

### 6.4 Server Actions（オプション）
- [ ] `src/app/actions/timeEntry.ts` 作成

---

## フェーズ7: 月次実績ページ実装

### 7.1 ページ作成
- [ ] `src/app/history/page.tsx` 作成

### 7.2 履歴テーブル
- [ ] `src/components/history/HistoryTable.tsx` 作成
  - 日付
  - ステータス（Badge）
  - 開始時刻
  - 終了時刻
  - 休憩時間
  - 実働時間
  - 備考

### 7.3 月選択UI
- [ ] 前月・次月ナビゲーション
- [ ] 現在表示中の年月表示

### 7.4 CSV出力機能
- [ ] CSVダウンロードボタン実装

---

## フェーズ8: 設定ページ実装

### 8.1 ページ作成
- [ ] `src/app/settings/page.tsx` 作成

### 8.2 時給設定
- [ ] 時給入力フォーム
- [ ] 保存ボタン
- [ ] 設定フック `src/hooks/useSettings.ts` 作成

---

## フェーズ9: ユーティリティ

### 9.1 日付フォーマット
- [ ] `src/lib/utils/date.ts` 作成
  - formatTime (HH:mm)
  - formatDate (YYYY年MM月DD日 (曜日))
  - formatDuration (H.h時間)

### 9.2 金額フォーマット
- [ ] `src/lib/utils/currency.ts` 作成
  - formatCurrency (¥XX,XXX)

### 9.3 共通UIコンポーネント
- [ ] `src/components/ui/Button.tsx` 作成
- [ ] `src/components/ui/Badge.tsx` 作成

---

## フェーズ10: デプロイ

### 10.1 Vercel 設定
- [ ] GitHubリポジトリ連携
- [ ] 環境変数設定
- [ ] ドメイン設定（オプション）

### 10.2 Supabase 本番設定
- [ ] 本番用リダイレクトURL追加
- [ ] RLSポリシー確認

### 10.3 動作確認
- [ ] 本番環境でGoogle認証テスト
- [ ] 打刻機能テスト
- [ ] レスポンシブ表示確認

---

## 優先度・依存関係

```
フェーズ1 ─┬─> フェーズ2 ───> フェーズ3 ───> フェーズ4
           │                      │
           │                      v
           │               フェーズ5 ───> フェーズ6
           │                      │
           │                      v
           │               フェーズ7
           │                      │
           │                      v
           │               フェーズ8
           │                      │
           v                      v
      フェーズ9 <─────────────────┘
           │
           v
      フェーズ10
```

---

## 備考

- 各フェーズ完了後、`docs/implement-log/` に実装ログを記録
- ファイル名形式: `yyyyMMdd_実装タイトル.md`
