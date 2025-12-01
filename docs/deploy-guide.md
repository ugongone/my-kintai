# MyKintai デプロイガイド

このドキュメントでは、MyKintaiアプリケーションをVercelにデプロイし、Supabaseの本番環境を設定する手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（GitHubでサインアップ可能）
- Supabaseプロジェクト（開発環境で使用しているもの）
- Google Cloud Consoleプロジェクト（OAuth設定済み）

---

## フェーズ1: GitHubリポジトリの準備

### 1.1 リモートリポジトリの作成

1. GitHubで新しいリポジトリを作成
   - リポジトリ名: `my-kintai` (任意)
   - プライベート/パブリックを選択
   - README、.gitignore、ライセンスは追加しない（既にローカルにある）

2. ローカルリポジトリをプッシュ
```bash
# リモートリポジトリを追加（既に設定済みの場合はスキップ）
git remote add origin https://github.com/YOUR_USERNAME/my-kintai.git

# メインブランチをプッシュ
git push -u origin main
```

### 1.2 環境変数の確認

以下の環境変数が`.env.local`に設定されていることを確認：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**重要**: `.env.local`はGitにコミットしないこと（`.gitignore`に含まれている）

---

## フェーズ2: Vercelへのデプロイ

### 2.1 Vercelアカウントの作成・ログイン

1. [Vercel](https://vercel.com)にアクセス
2. "Sign Up"をクリックし、GitHubアカウントで認証
3. 必要に応じてVercel CLIをインストール（オプション）
```bash
npm i -g vercel
```

### 2.2 プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリの連携を許可
3. `my-kintai`リポジトリを選択
4. 「Import」をクリック

### 2.3 プロジェクト設定

#### Framework Preset
- **Framework**: Next.js（自動検出される）
- **Root Directory**: `./`（デフォルト）
- **Build Command**: `npm run build`（デフォルト）
- **Output Directory**: `.next`（デフォルト）

#### 環境変数の設定

「Environment Variables」セクションで以下を追加：

| Name | Value | 説明 |
|------|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Anon Key |

**注意**:
- すべての環境を選択（Production, Preview, Development）
- 値は`.env.local`からコピー

### 2.4 デプロイ実行

1. 「Deploy」ボタンをクリック
2. ビルドプロセスを確認（数分かかる）
3. デプロイ完了後、Vercelから提供されるURLを確認
   - 例: `https://my-kintai-xxxx.vercel.app`

---

## フェーズ3: Supabase本番設定

### 3.1 本番用リダイレクトURLの追加

1. Supabaseダッシュボードにアクセス
2. プロジェクト → Authentication → URL Configuration
3. 「Redirect URLs」に以下を追加：

```
https://your-app.vercel.app/auth/callback
```

**複数のVercelドメインがある場合**:
- プロダクション: `https://my-kintai.vercel.app/auth/callback`
- プレビュー: `https://my-kintai-*.vercel.app/auth/callback`（ワイルドカード可）

4. 「Save」をクリック

### 3.2 Google OAuth設定の更新

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. プロジェクトを選択
3. 「APIs & Services」→「Credentials」
4. 使用しているOAuth 2.0クライアントIDを選択
5. 「承認済みのリダイレクトURI」に以下を追加：

```
https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
https://your-app.vercel.app/auth/callback
```

6. 「保存」をクリック

### 3.3 RLSポリシーの確認

以下のテーブルでRLS（Row Level Security）が有効になっていることを確認：

#### time_entries テーブル
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

#### settings テーブル
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`

確認方法：
1. Supabaseダッシュボード → Table Editor
2. 各テーブルの「RLS」アイコンが有効になっていることを確認
3. ポリシー設定を確認

---

## フェーズ4: 動作確認

### 4.1 Google認証のテスト

1. デプロイしたURL（`https://your-app.vercel.app`）にアクセス
2. ログインページが表示されることを確認
3. 「Googleでログイン」をクリック
4. Google認証画面が表示されることを確認
5. 認証後、ダッシュボードにリダイレクトされることを確認

### 4.2 打刻機能のテスト

1. ダッシュボードで「業務開始」ボタンをクリック
2. ステータスが「稼働中」に変わることを確認
3. 「休憩開始」「休憩終了」「業務終了」をテスト
4. Supabaseダッシュボードで`time_entries`テーブルにデータが保存されていることを確認

### 4.3 月次実績ページのテスト

1. サイドバーから「月次実績」に移動
2. 打刻データが表示されることを確認
3. 月の切り替えが機能することを確認
4. CSV出力が正常に動作することを確認

### 4.4 設定ページのテスト

1. サイドバーから「設定」に移動
2. 現在の時給が表示されることを確認
3. 時給を変更して保存
4. ダッシュボードの概算報酬額が更新されることを確認

### 4.5 レスポンシブ表示の確認

1. ブラウザの開発者ツールを開く（F12）
2. デバイスツールバーをクリック（Ctrl+Shift+M / Cmd+Shift+M）
3. 以下のデバイスサイズで表示を確認：
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1024px以上)

確認項目：
- サイドバーがモバイルではハンバーガーメニューになる
- テーブルが横スクロール可能
- ボタンやカードが適切に配置される

---

## フェーズ5: カスタムドメイン設定（オプション）

### 5.1 Vercelでのドメイン設定

1. Vercelプロジェクトダッシュボード → Settings → Domains
2. 「Add」をクリックしてドメインを入力
   - 例: `my-kintai.com` または `kintai.yourdomain.com`
3. DNSレコードの設定指示に従う

### 5.2 DNS設定

ドメインレジストラ（お名前.com、Route53など）で以下を設定：

**Aレコード（ルートドメインの場合）**:
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAMEレコード（サブドメインの場合）**:
```
Type: CNAME
Name: kintai
Value: cname.vercel-dns.com
```

### 5.3 Supabase・Google OAuthの更新

カスタムドメイン使用時は、以下も更新：
- SupabaseのリダイレクトURL
- Google Cloud ConsoleのリダイレクトURI

---

## トラブルシューティング

### ビルドエラーが発生する場合

1. ローカルで`npm run build`を実行して確認
2. Vercelの「Deployments」タブでビルドログを確認
3. 環境変数が正しく設定されているか確認

### 認証が失敗する場合

1. SupabaseのリダイレクトURLが正しく設定されているか確認
2. Google Cloud ConsoleのリダイレクトURIを確認
3. ブラウザのコンソールでエラーメッセージを確認

### データが表示されない場合

1. RLSポリシーが正しく設定されているか確認
2. ブラウザのNetwork タブでAPIリクエストを確認
3. Supabaseダッシュボードでデータが保存されているか確認

---

## 継続的デプロイ

Vercelは自動的に継続的デプロイ（CD）を設定します：

- **Productionデプロイ**: `main`ブランチへのプッシュ
- **Previewデプロイ**: プルリクエストの作成

### デプロイフロー

1. 機能ブランチを作成
```bash
git checkout -b feature/new-feature
```

2. 変更をコミット・プッシュ
```bash
git add .
git commit -m "feat: 新機能を追加"
git push origin feature/new-feature
```

3. GitHubでプルリクエストを作成
4. VercelがプレビューURLを自動生成
5. レビュー・テスト後、`main`にマージ
6. 本番環境に自動デプロイ

---

## セキュリティチェックリスト

デプロイ前に以下を確認：

- [ ] `.env.local`がGitにコミットされていない
- [ ] RLSポリシーが全テーブルで有効
- [ ] Supabase Anon Keyのみを使用（Service Keyは使用しない）
- [ ] Google OAuthのリダイレクトURIが制限されている
- [ ] HTTPSが有効（Vercelはデフォルトで有効）
- [ ] CORSが適切に設定されている（Supabaseはデフォルトで設定済み）

---

## 次のステップ

デプロイが完了したら：

1. チームメンバーや関係者にURLを共有
2. 本番環境での使用を開始
3. フィードバックを収集して改善
4. 必要に応じて機能を追加
5. パフォーマンスやエラーをモニタリング

Vercelは自動的に以下を提供：
- パフォーマンスモニタリング
- アクセス分析
- エラートラッキング

必要に応じて、Sentryなどの外部モニタリングツールも検討してください。
