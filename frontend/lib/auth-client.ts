import { createAuthClient } from "better-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export const authClient = createAuthClient({
    baseURL: BASE_URL,
});