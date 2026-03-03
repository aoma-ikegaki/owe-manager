import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import * as schema from '../db/schema';
import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';

export const getAuth = (db: D1Database, env: any) => {
  return betterAuth({
    database: drizzleAdapter(drizzle(db), {
      provider: "sqlite",
      schema: {
        ...schema,
      },
    }),
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
      },
    },
    baseURL: env.BETTER_AUTH_URL || "http://localhost:8787/api/auth",
    plugins: [
      anonymous()
    ],

    secret: env.BETTER_AUTH_SECRET || "BETTER_AUTH_SECRET_ANY_STRING_AT_LEAST_32_CHARS",
    trustedOrigins: [
      "http://localhost:3000",
      "https://owe-manager-web.pages.dev",
      "https://8c81e92e.owe-manager-web.pages.dev",
      "https://owe-manager-frontend-aoma-dev.pages.dev",
    ],
  });
};