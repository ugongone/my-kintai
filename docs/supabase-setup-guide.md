# Supabase セットアップガイド

このガイドでは、MyKintaiアプリケーション用のSupabaseプロジェクトをセットアップする手順を説明します。

## 1. Supabaseプロジェクト作成

### 1.1 Supabaseにアクセス
1. [Supabase](https://supabase.com) にアクセス
2. GitHubアカウントでサインイン
3. 「New Project」をクリック

### 1.2 プロジェクト設定
以下の情報を入力:
- **Project Name**: `my-kintai` (任意の名前)
- **Database Password**: 安全なパスワードを生成（メモしておく）
- **Region**: `Northeast Asia (Tokyo)` を選択（日本からのアクセスが速い）
- **Pricing Plan**: `Free` を選択

「Create new project」をクリックして作成を完了します。

### 1.3 プロジェクトURLとAPIキーの取得
プロジェクトが作成されたら:
1. 左サイドバーの「Project Settings」→「API」を開く
2. 以下の情報をコピー:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.4 環境変数の設定
プロジェクトルートに `.env.local` ファイルを作成:

```bash
cp .env.example .env.local
```

`.env.local` を編集して、取得したURLとキーを設定:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **注意**: `.env.local` はGitにコミットしないでください（.gitignoreに含まれています）

---

## 2. データベーススキーマ構築

### 2.1 SQLエディタを開く
1. Supabaseダッシュボードで「SQL Editor」を開く
2. 「New Query」をクリック

### 2.2 マイグレーションSQLを実行
[supabase/migrations/20251130000000_initial_schema.sql](../supabase/migrations/20251130000000_initial_schema.sql) の内容をコピーして、SQLエディタに貼り付けます。

「Run」をクリックしてSQLを実行します。

### 2.3 テーブル確認
1. 左サイドバーの「Table Editor」を開く
2. 以下のテーブルが作成されていることを確認:
   - `time_entries` - 打刻記録
   - `settings` - ユーザー設定

---

## 3. Google OAuth設定

### 3.1 Google Cloud Consoleでプロジェクト作成
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（例: `my-kintai`）

### 3.2 OAuth同意画面の設定
1. 「APIとサービス」→「OAuth同意画面」を開く
2. User Type: **外部** を選択
3. 必須項目を入力:
   - **アプリ名**: MyKintai
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **デベロッパーの連絡先情報**: あなたのメールアドレス
4. 「保存して次へ」をクリック
5. スコープは追加不要（デフォルトのまま）
6. テストユーザーに自分のGoogleアカウントを追加（開発中のみ）

### 3.3 OAuthクライアントIDの作成
1. 「認証情報」→「認証情報を作成」→「OAuthクライアントID」を選択
2. アプリケーションの種類: **ウェブアプリケーション**
3. 名前: `MyKintai Web Client`
4. **承認済みのリダイレクトURI** に以下を追加:
   ```
   https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
   ```
   （xxxxxxxxxxxxx は自分のSupabaseプロジェクトURL）

5. 「作成」をクリック
6. **クライアントID** と **クライアントシークレット** をコピー

### 3.4 SupabaseでGoogle認証を有効化
1. Supabaseダッシュボードで「Authentication」→「Providers」を開く
2. 「Google」を選択
3. 以下を入力:
   - **Enabled**: ON にする
   - **Client ID**: Google CloudでコピーしたクライアントID
   - **Client Secret**: Google Cloudでコピーしたクライアントシークレット
4. 「Save」をクリック

### 3.5 リダイレクトURLの追加（ローカル開発用）
1. Supabaseの「Authentication」→「URL Configuration」を開く
2. **Redirect URLs** に以下を追加:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3003/auth/callback
   ```
3. 「Save」をクリック

---

## 4. 動作確認

セットアップが完了したら、以下を確認:

### 4.1 環境変数が正しく設定されているか
```bash
cat .env.local
```

以下が含まれているか確認:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4.2 データベーステーブルが作成されているか
Supabaseの「Table Editor」で以下を確認:
- `time_entries` テーブルが存在
- `settings` テーブルが存在
- 各テーブルのRLS（Row Level Security）が有効になっている

### 4.3 Google認証が有効になっているか
Supabaseの「Authentication」→「Providers」で:
- Googleプロバイダーが「Enabled」になっている

---

## トラブルシューティング

### データベース接続エラー
- `.env.local` のURLとキーが正しいか確認
- Supabaseプロジェクトが起動しているか確認（無料プランは一定期間非アクティブで一時停止する場合あり）

### Google OAuth エラー
- リダイレクトURLが正確に設定されているか確認
- Google CloudのOAuth同意画面が「公開」または「テスト中」になっているか確認
- テストユーザーに自分のアカウントが追加されているか確認

### RLSエラー（Permission Denied）
- RLSポリシーが正しく設定されているか確認
- ユーザーが正しく認証されているか確認（`auth.uid()`がnullでないか）

---

## 次のステップ

Supabaseのセットアップが完了したら、フェーズ3の認証機能実装に進みます。
