# owe-manager(開発中)

🌐 **本番URL**: https://owe-manager-frontend.pages.dev



「誰に、いくら、いつまでに」返すべきかを明確にし、返済漏れを防ぐための個人向け債務管理アプリケーションです。


## 技術スタック
| カテゴリ | 技術 |
| :--- | :--- |
| Frontend | Next.js (App Router), TanStack Query, Zod, Tailwind CSS, Sonner |
| Backend | Hono, Hono RPC, Cloudflare Workers |
| Database | Cloudflare D1(SQLite), Drizzle ORM, Cloudflare Pages |

## 主な機能
- 借金の表示、登録、編集、削除（CRUD）
- 返済状況のステータス更新
- 現在の合計借金額の表示
- 未返済/返済済みの一覧表示

## ディレクトリ構成
owe-manager/
├── frontend/          # Next.js アプリ（Cloudflare Pages）
│   ├── app/
│   │   └── page.tsx   # メイン画面（ログイン・借金一覧）
│   ├── lib/
│   │   ├── api.ts          # Hono RPC クライアント
│   │   └── auth-client.ts  # Better Auth クライアント
│   └── next.config.ts
│
├── backend/           # Hono API（Cloudflare Workers）
│   ├── src/
│   │   ├── index.ts        # APIルート定義
│   │   ├── lib/auth.ts     # Better Auth 設定
│   │   └── db/schema.ts    # Drizzle ORM スキーマ
│   ├── migrations/         # D1 マイグレーションSQL
│   └── wrangler.jsonc      # Cloudflare Workers 設定
│
└── shared/            # フロントエンド・バックエンド共通
    └── schemas.ts     # Zod バリデーションスキーマ

## システム構成図

```mermaid
graph TB
    User["👤 ユーザー"]

    subgraph GitHub["GitHub / CI"]
        Repo["aoma-ikegaki/owe-manager<br/>mainブランチへpush"]
    end

    subgraph CFPages["Cloudflare Pages"]
        Frontend["Next.js 16<br/>owe-manager-frontend.pages.dev<br/>─────────────────<br/>・ログイン画面<br/>・借金一覧・CRUD UI<br/>・TanStack Query<br/>・Better Auth Client"]
    end

    subgraph CFWorkers["Cloudflare Workers"]
        Backend["Hono 4<br/>backend.owe-manager-backend-aoma-dev.workers.dev<br/>─────────────────<br/>・/api/debts/* (CRUD)<br/>・/api/auth/* (Better Auth)"]
    end

    subgraph CFD1["Cloudflare D1 (SQLite)"]
        DB[("debts / user<br/>session / account<br/>verification")]
    end

    Google["🔑 Google OAuth<br/>accounts.google.com"]

    User -->|"ブラウザ"| Frontend
    Frontend -->|"Hono RPC<br/>/api/debts/*"| Backend
    Frontend -->|"認証<br/>/api/auth/*"| Backend
    Backend -->|"Drizzle ORM"| DB
    Backend <-->|"OAuth フロー"| Google
    Repo -->|"自動デプロイ"| CFPages
```

## 認証フロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant FE as Frontend (Pages)
    participant BE as Backend (Workers)
    participant G as Google OAuth
    participant DB as D1 Database

    User->>FE: 「Googleでログイン」クリック
    FE->>BE: POST /api/auth/sign-in/social
    BE->>G: Google 認証画面へリダイレクト
    User->>G: Googleアカウントで承認
    G->>BE: /api/auth/callback/google
    BE->>G: アクセストークンと交換
    G-->>BE: ユーザー情報
    BE->>DB: ユーザー・セッションを保存
    BE-->>FE: セッションCookieをセットしてリダイレクト
    FE->>User: ログイン完了・借金一覧を表示
```