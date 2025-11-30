# MyKintai 実装Todoリスト

## フェーズ1: プロジェクトセットアップ ✅

### 1.1 Next.js プロジェクト初期化
- [x] `npx create-next-app@latest` でプロジェクト作成
  - TypeScript: Yes
  - Tailwind CSS: Yes
  - App Router: Yes
  - src/ directory: Yes
- [x] 不要なボイラープレート削除
- [x] `.env.example` 作成

### 1.2 依存関係インストール
- [x] `@supabase/supabase-js` インストール
- [x] `@supabase/ssr` インストール
- [x] `lucide-react` インストール

### 1.3 プロジェクト構成
- [x] ディレクトリ構造作成
  - `src/components/`
  - `src/lib/`
  - `src/hooks/`
  - `src/types/`
- [x] Tailwind CSS カスタム設定（配色）

---

## フェーズ2: Supabase セットアップ ✅

### 2.1 Supabase プロジェクト作成
- [x] Supabase ダッシュボードでプロジェクト作成（セットアップガイド作成済み）
- [x] プロジェクトURL・Anon Key 取得（セットアップガイドに手順記載）
- [x] `.env.local` に環境変数設定（セットアップガイドに手順記載）

### 2.2 データベース構築
- [x] `time_entries` テーブル作成（マイグレーションSQL作成済み）
- [x] `settings` テーブル作成（マイグレーションSQL作成済み）
- [x] インデックス作成（マイグレーションSQL作成済み）
- [x] RLSポリシー設定（マイグレーションSQL作成済み）

### 2.3 Google OAuth 設定
- [x] Google Cloud Console でOAuthクライアント作成（セットアップガイドに手順記載）
- [x] Supabase で Google プロバイダー有効化（セットアップガイドに手順記載）
- [x] リダイレクトURL設定（セットアップガイドに手順記載）

---

## フェーズ3: 認証機能実装 ✅

### 3.1 Supabase クライアント設定
- [x] `src/lib/supabase/client.ts` 作成（ブラウザ用）
- [x] `src/lib/supabase/server.ts` 作成（サーバー用）

### 3.2 認証ページ
- [x] `src/app/login/page.tsx` 作成
  - Googleログインボタン
  - アプリロゴ・説明
- [x] `src/app/auth/login/route.ts` 作成（ログイン処理）
- [x] `src/app/auth/callback/route.ts` 作成

### 3.3 認証ミドルウェア
- [x] `src/middleware.ts` 作成
  - 未認証ユーザーを `/login` へリダイレクト
  - セッション更新処理

### 3.4 認証フック
- [x] `src/hooks/useAuth.ts` 作成
  - ユーザー情報取得
  - ログアウト処理

---

## フェーズ4: 共通レイアウト実装 ✅

### 4.1 ルートレイアウト
- [x] `src/app/layout.tsx` 更新
  - フォント設定（Noto Sans JP）
  - メタデータ設定

### 4.2 サイドバー
- [x] `src/components/layout/Sidebar.tsx` 作成
  - ロゴエリア（Briefcase アイコン + "MyKintai"）
  - メニューリスト（打刻・ホーム / 月次実績 / 設定）
  - ユーザープロファイル表示
  - ログアウトボタン
  - アクティブ状態のスタイリング

### 4.3 ヘッダー（モバイル用）
- [x] `src/components/layout/Header.tsx` 作成
  - ハンバーガーメニューボタン
  - 通知アイコン

### 4.4 レスポンシブ対応
- [x] `src/components/layout/AppLayout.tsx` 作成
- [x] モバイル用サイドバー（オーバーレイ形式）
- [x] サイドバー開閉状態管理
- [x] 認証済みレイアウト作成（Route Groups使用）

---

## フェーズ5: ダッシュボード（打刻・ホーム）実装 ✅

### 5.1 ページ作成
- [x] `src/app/(authenticated)/page.tsx` 更新（ダッシュボード）

### 5.2 ステータスカード
- [x] `src/components/dashboard/StatusCard.tsx` 作成
  - 現在時刻表示（リアルタイム更新）
  - 日付・曜日表示
  - ステータス表示（稼働外 / 稼働中 / 休憩中）
  - 打刻ボタン（状態に応じて表示切替）
    - 業務開始（Blue）
    - 休憩開始（Orange）/ 業務終了（Slate）
    - 休憩終了（Green）

### 5.3 手動打刻モーダル
- [x] `src/components/ui/Modal.tsx` 作成
- [x] `src/components/dashboard/ManualEntryModal.tsx` 作成
  - 日付選択
  - 時刻選択
  - 打刻種別選択
  - 備考入力

### 5.4 実績サマリーカード
- [x] `src/components/dashboard/SummaryCard.tsx` 作成
  - 総稼働時間表示
  - 概算報酬額表示（時給 × 稼働時間）

### 5.5 直近の稼働テーブル
- [x] `src/components/dashboard/RecentHistory.tsx` 作成
  - 直近の稼働表示
  - 「すべて見る」リンク

### 5.6 共通UIコンポーネント
- [x] `src/components/ui/Button.tsx` 作成
- [x] `src/components/ui/Badge.tsx` 作成

---

## フェーズ6: 打刻データ管理 ✅

### 6.1 型定義
- [x] `src/types/database.ts` 作成（フェーズ3で完了）
  - TimeEntry 型
  - Settings 型
  - EntryType 型（work_start, work_end, break_start, break_end）

### 6.2 打刻フック
- [x] `src/hooks/useTimeEntries.ts` 作成
  - 今月の打刻一覧取得
  - 打刻登録
  - 打刻更新
  - 打刻削除

### 6.3 設定フック
- [x] `src/hooks/useSettings.ts` 作成
  - 時給設定の取得・更新
  - 初回アクセス時のデフォルト設定作成

### 6.4 ステータス計算ロジック
- [x] `src/lib/utils/workStatus.ts` 作成
  - 最新の打刻から現在のステータスを計算
  - 稼働時間計算
  - 月次統計計算

### 6.5 ダッシュボード統合
- [x] `src/app/(authenticated)/page.tsx` 更新
  - データフックとの統合
  - 打刻処理の実装
  - 手動打刻の実装

### 6.6 設定ページ
- [x] `src/app/(authenticated)/settings/page.tsx` 更新
  - 時給設定フォーム
  - 更新処理の実装

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
