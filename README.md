# owe-manager(開発中)

「誰に、いくら、いつまでに」返すべきかを明確にし、返済漏れを防ぐための個人向け債務管理アプリケーションです。

[デモサイト] (https://9e3a0280.owe-manager-web.pages.dev)

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

## システム構成図

```mermaid
graph TD
    subgraph Shared [共有 / Shared]
        Schema[Zod Schemas<br/>shared/schemas.ts]
        Types[TypeScript Types<br/>InsertDebt / Debt]
    end

    subgraph Client [クライアント / Next.js]
        NextJS[Next.js App Router]
        TQ[TanStack Query]
        CZod[Zod Check<br/>フロント側検証]
        HonoClient[Hono RPC Client<br/>hc]
    end

    subgraph Cloudflare_Infrastructure [Cloudflare プラットフォーム]
        CFP[Cloudflare Pages<br/>Hosting]
        CFW[Cloudflare Workers / Hono<br/>API Server]
        BZod[zValidator<br/>バック側検証]
        Drizzle[Drizzle ORM]
        D1[(Cloudflare D1<br/>SQLite DB)]
    end

    %% 共有関係
    Schema -.-> CZod
    Schema -.-> BZod
    Types -.-> Types_Client[Client Types]
    Types -.-> Types_Back[Backend Types]

    %% 通信フロー
    NextJS -- "① 静的配信" --- CFP
    NextJS --> TQ
    TQ --> CZod
    CZod -- "② 型安全なリクエスト" --> HonoClient
    HonoClient -- "Hono RPC" --> BZod
    BZod -- "③ バリデーション合格" --> CFW
    CFW -- "④ SQL操作" --> Drizzle
    Drizzle --> D1
    D1 -- "⑤ データ返却" --> CFW
    CFW -- "⑥ 型安全なレスポンス" --> NextJS

    %% スタイル設定
    style Shared fill:#e1f5fe,stroke:#01579b
    style CZod fill:#fff9c4,stroke:#fbc02d

    style BZod fill:#fff9c4,stroke:#fbc02d

