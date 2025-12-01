# MyKintai - 業務委託・副業向け勤怠管理アプリ

MyKintaiは、業務委託や副業ワーカー向けに最適化されたSaaS型勤怠管理アプリケーションです。
固定の所定労働時間や残業概念を排除し、**「稼働実績の積み上げ」と「報酬見込み」の可視化**に焦点を当てています。

## 特徴

- 📱 **シンプルな打刻**: 業務開始・休憩開始/終了・業務終了をワンクリック
- 📊 **リアルタイム集計**: 今月の総稼働時間と概算報酬額を自動計算
- 📅 **月次実績管理**: 過去の月の稼働データを表示・CSV出力
- ⚙️ **時給設定**: 時給単価を設定して報酬見込みを表示
- 🔐 **Google認証**: 安全なGoogle OAuth認証
- 📱 **レスポンシブ対応**: PC・タブレット・スマートフォンで利用可能

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router)
- **スタイリング**: Tailwind CSS
- **認証**: Supabase Auth (Google OAuth)
- **データベース**: Supabase (PostgreSQL)
- **デプロイ**: Vercel
- **言語**: TypeScript

## セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn
- Supabaseアカウント
- Google Cloud Consoleアカウント

### 1. リポジトリのクローン

```bash
git clone https://github.com/YOUR_USERNAME/my-kintai.git
cd my-kintai
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`を`.env.local`にコピーし、必要な値を設定します。

```bash
cp .env.example .env.local
```

`.env.local`の内容：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabaseのセットアップ

詳細は[docs/supabase-setup-guide.md](docs/supabase-setup-guide.md)を参照してください。

1. Supabaseでプロジェクトを作成
2. マイグレーションSQLを実行（`supabase/migrations/`配下）
3. Google OAuthを設定
4. リダイレクトURLを設定

### 5. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)にアクセスしてアプリケーションを確認できます。

## プロジェクト構成

```
my-kintai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (authenticated)/    # 認証済みルート
│   │   │   ├── page.tsx        # ダッシュボード
│   │   │   ├── history/        # 月次実績
│   │   │   └── settings/       # 設定
│   │   ├── login/              # ログインページ
│   │   └── auth/               # 認証コールバック
│   ├── components/             # Reactコンポーネント
│   │   ├── dashboard/          # ダッシュボード用
│   │   ├── history/            # 月次実績用
│   │   ├── layout/             # レイアウト用
│   │   └── ui/                 # 共通UI
│   ├── hooks/                  # カスタムフック
│   ├── lib/                    # ユーティリティ
│   │   ├── supabase/           # Supabaseクライアント
│   │   └── utils/              # 共通関数
│   └── types/                  # TypeScript型定義
├── docs/                       # ドキュメント
│   ├── specification.md        # 仕様書
│   ├── supabase-setup-guide.md # Supabaseセットアップガイド
│   ├── deploy-guide.md         # デプロイガイド
│   └── implement-log/          # 実装ログ
├── supabase/                   # Supabaseマイグレーション
└── public/                     # 静的ファイル
```

## 主な機能

### ダッシュボード（打刻・ホーム）

- 現在時刻のリアルタイム表示
- ステータス表示（稼働外 / 稼働中 / 休憩中）
- 打刻ボタン（業務開始・休憩開始/終了・業務終了）
- 手動打刻機能（時間指定）
- 今月の総稼働時間と概算報酬額の表示
- 直近の稼働履歴

### 月次実績ページ

- 月選択（前月・次月ナビゲーション）
- 統計サマリー（総稼働時間・稼働日数・概算報酬額）
- 日次データテーブル（日付・ステータス・開始/終了時刻・休憩時間・実働時間）
- CSV出力機能

### 設定ページ

- 時給設定
- 概算報酬計算への反映

## デプロイ

詳細は[docs/deploy-guide.md](docs/deploy-guide.md)を参照してください。

### Vercelへのデプロイ

1. GitHubリポジトリをVercelにインポート
2. 環境変数を設定
3. デプロイ実行

### Supabase本番設定

1. 本番用リダイレクトURLを追加
2. Google OAuthのリダイレクトURIを更新
3. RLSポリシーを確認

## スクリプト

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# リント
npm run lint
```

## ドキュメント

- [仕様書](docs/specification.md)
- [技術仕様書](docs/technical-specification.md)
- [Supabaseセットアップガイド](docs/supabase-setup-guide.md)
- [デプロイガイド](docs/deploy-guide.md)
- [実装TODO](docs/implementation-todo.md)
- [実装ログ](docs/implement-log/)

## ライセンス

このプロジェクトは個人利用を目的としています。
