# MyKintai 技術仕様書

## 1. 技術スタック概要

### 1.1 フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| **Next.js** | 14.x (App Router) | Reactフレームワーク |
| **TypeScript** | 5.x | 型安全な開発 |
| **Tailwind CSS** | 3.x | スタイリング |
| **lucide-react** | latest | アイコンライブラリ |

#### 選定理由
- **Next.js (App Router)**: Vercelとのネイティブ統合、Server Components対応、優れたDX
- **TypeScript**: 型安全性によるバグ防止、IDEサポートの向上
- **Tailwind CSS**: デザインモックで既に使用済み、高速なスタイリング

### 1.2 バックエンド / BaaS

| 技術 | 用途 |
|------|------|
| **Supabase** | PostgreSQL + 認証 + API |

#### Supabase採用理由
- Google OAuth認証が組み込み済み
- PostgreSQL（RLS対応）で柔軟なアクセス制御
- 無料枠が十分（500MB、50,000 MAU）
- リアルタイム機能（将来の拡張に対応可能）

### 1.3 デプロイ

| 技術 | 用途 |
|------|------|
| **Vercel** | ホスティング・CI/CD |

---

## 2. プロジェクト構成

```
my-kintai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── page.tsx            # ダッシュボード（ホーム）
│   │   ├── history/
│   │   │   └── page.tsx        # 月次実績ページ
│   │   ├── settings/
│   │   │   └── page.tsx        # 設定ページ
│   │   ├── login/
│   │   │   └── page.tsx        # ログインページ
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts    # OAuth コールバック
│   │
│   ├── components/             # UIコンポーネント
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx     # サイドバー
│   │   │   └── Header.tsx      # ヘッダー
│   │   ├── dashboard/
│   │   │   ├── StatusCard.tsx  # 打刻カード
│   │   │   ├── SummaryCard.tsx # 実績サマリー
│   │   │   └── RecentHistory.tsx
│   │   ├── history/
│   │   │   └── HistoryTable.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Badge.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # ブラウザ用クライアント
│   │   │   ├── server.ts       # サーバー用クライアント
│   │   │   └── middleware.ts   # 認証ミドルウェア
│   │   ├── utils/
│   │   │   ├── date.ts         # 日付フォーマット
│   │   │   └── currency.ts     # 金額フォーマット
│   │   └── constants.ts        # 定数定義
│   │
│   ├── hooks/
│   │   ├── useAuth.ts          # 認証フック
│   │   ├── useTimeEntries.ts   # 打刻データフック
│   │   └── useSettings.ts      # 設定フック
│   │
│   └── types/
│       ├── database.ts         # Supabase型定義
│       └── index.ts            # 共通型定義
│
├── public/
├── docs/
│   ├── specification.md        # 機能仕様書
│   ├── technical-specification.md  # 本ドキュメント
│   └── implement-log/          # 実装ログ
├── design/
│   └── designMock.jsx          # デザインモック
├── supabase/
│   └── migrations/             # DBマイグレーション
├── .env.local                  # 環境変数（ローカル）
├── .env.example                # 環境変数テンプレート
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 3. データベース設計

### 3.1 ER図

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────┐
│   users     │       │  time_entries   │       │   settings   │
├─────────────┤       ├─────────────────┤       ├──────────────┤
│ id (PK)     │──────<│ id (PK)         │       │ id (PK)      │
│ email       │       │ user_id (FK)    │>──────│ user_id (FK) │
│ name        │       │ entry_type      │       │ hourly_wage  │
│ avatar_url  │       │ timestamp       │       │ created_at   │
│ created_at  │       │ note            │       │ updated_at   │
└─────────────┘       │ created_at      │       └──────────────┘
                      └─────────────────┘
```

### 3.2 テーブル定義

#### users テーブル
Supabase Auth が自動管理する `auth.users` を使用。追加のプロフィール情報が必要な場合は `public.profiles` を作成。

```sql
-- profiles テーブル（オプション: 追加情報が必要な場合）
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### time_entries テーブル
打刻記録を格納。`work_start`と`work_end`のペアで1セッションを表す。1日に複数セッション登録可能。

```sql
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('work_start', 'work_end')),
  entry_time TIMESTAMPTZ NOT NULL,
  work_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_entry_time ON public.time_entries(entry_time);
CREATE INDEX idx_time_entries_work_date ON public.time_entries(work_date);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| user_id | UUID | ユーザーID（外部キー） |
| entry_type | TEXT | 打刻種別: `work_start`, `work_end` |
| entry_time | TIMESTAMPTZ | 打刻日時 |
| work_date | DATE | 勤務日（0-4時は前日扱い） |
| note | TEXT | 備考（作業内容など） |
| created_at | TIMESTAMPTZ | レコード作成日時 |
| updated_at | TIMESTAMPTZ | レコード更新日時 |

**セッションの概念:**
- `work_start` → `work_end` で1セッション（1回の稼働）
- 1日に複数セッション登録可能（例: 9:00-12:00, 13:00-18:00）
- 休憩 = セッション間の空白時間として自動計算

#### settings テーブル
ユーザーごとの設定を格納。

```sql
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  hourly_wage INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| user_id | UUID | ユーザーID（ユニーク） |
| hourly_wage | INTEGER | 時給（円） |
| created_at | TIMESTAMPTZ | レコード作成日時 |
| updated_at | TIMESTAMPTZ | レコード更新日時 |

### 3.3 Row Level Security (RLS)

各ユーザーは自分のデータのみアクセス可能。

```sql
-- time_entries RLS
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON public.time_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON public.time_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON public.time_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON public.time_entries FOR DELETE
  USING (auth.uid() = user_id);

-- settings RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.settings FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 4. 認証フロー

### 4.1 Google OAuth 設定

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  ユーザー │────>│ ログイン  │────>│  Google  │────>│ Callback │
│          │     │  ページ   │     │  OAuth   │     │  処理    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
                                                        v
                                                  ┌──────────┐
                                                  │ダッシュ   │
                                                  │ボード    │
                                                  └──────────┘
```

### 4.2 実装コード例

#### ログインページ (`src/app/login/page.tsx`)
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button onClick={handleGoogleLogin}>
      Googleでログイン
    </button>
  )
}
```

#### コールバック処理 (`src/app/auth/callback/route.ts`)
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/`)
}
```

### 4.3 ミドルウェア（認証保護）

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 認証チェック & セッション更新
  // 未認証の場合は /login へリダイレクト
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login|auth).*)'],
}
```

---

## 5. API設計

### 5.1 データ取得パターン

Supabase Clientを使用してデータ操作を行う。

#### 打刻データ取得
```typescript
// 今月の打刻一覧取得
const { data, error } = await supabase
  .from('time_entries')
  .select('*')
  .gte('timestamp', startOfMonth)
  .lte('timestamp', endOfMonth)
  .order('timestamp', { ascending: false })
```

#### 打刻登録
```typescript
const { data, error } = await supabase
  .from('time_entries')
  .insert({
    user_id: userId,
    entry_type: 'work_start',
    timestamp: new Date().toISOString(),
    note: null,
  })
```

### 5.2 Server Actions（オプション）

複雑なビジネスロジックが必要な場合、Server Actionsを使用。

```typescript
// src/app/actions/timeEntry.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function createTimeEntry(entryType: string, note?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  return await supabase
    .from('time_entries')
    .insert({
      user_id: user.id,
      entry_type: entryType,
      timestamp: new Date().toISOString(),
      note,
    })
}
```

---

## 6. デプロイ設定

### 6.1 環境変数

#### `.env.example`
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx

# Optional: Supabase Service Role (サーバーサイドのみ)
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx
```

### 6.2 Vercel設定

1. GitHubリポジトリと連携
2. 環境変数を設定（Production / Preview / Development）
3. ビルドコマンド: `npm run build`
4. 出力ディレクトリ: `.next`

### 6.3 Supabase設定

1. プロジェクト作成
2. Google OAuth プロバイダー有効化
   - Google Cloud Console でクライアントID/シークレット取得
   - Supabase の Authentication > Providers で設定
3. リダイレクトURL設定
   - `https://your-domain.vercel.app/auth/callback`
4. テーブル・RLSポリシー作成（マイグレーション実行）

---

## 7. 開発環境セットアップ

```bash
# リポジトリクローン
git clone https://github.com/your-username/my-kintai.git
cd my-kintai

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local を編集してSupabase認証情報を設定

# 開発サーバー起動
npm run dev
```

---

## 8. 主要パッケージ

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/ssr": "^0.1.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0"
  }
}
```
