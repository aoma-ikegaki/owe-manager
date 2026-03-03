import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export const authClient = createAuthClient({
    // バックエンド（Hono）のURLを指定
    baseURL: BASE_URL, 
    plugins: [
        anonymousClient() // ゲスト機能を有効化
    ]
});