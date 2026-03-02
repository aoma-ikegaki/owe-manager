import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { anonymous } from 'better-auth/plugins';
import * as schema from '../db/schema';
import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';

export const getAuth = (db: D1Database) => {
  return betterAuth({
    database: drizzleAdapter(drizzle(db), {
      provider: "sqlite",
      schema: {
        ...schema,
      },
    }),

    plugins: [
      anonymous()
    ],

    secret: "BETTER_AUTH_SECRET_ANY_STRING",
    trustedOrigins: ["http://localhost:3000"],
  });
};