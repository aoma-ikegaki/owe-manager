import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { drizzle } from 'drizzle-orm/d1'
import { debts } from './db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { insertDebtSchema } from '../../shared/schemas'
import { getAuth } from './lib/auth'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return 'http://localhost:3000';

    const allowedOrigins = [
      'http://localhost:3000',
      'https://owe-manager-web.pages.dev',
      'https://owe-manager-frontend-aoma-dev.pages.dev',
      'https://owe-manager-frontend-aoma-dev.workers.dev',
    ];

    if (allowedOrigins.includes(origin)) return origin;
    if (origin.endsWith('.owe-manager-web.pages.dev')) return origin;

    return 'http://localhost:3000';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true, 
}))

// Better Authのエンドポイントを追加
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = getAuth(c.env.DB, c.env);
  return auth.handler(c.req.raw);
})

const routes = app.basePath('/api')

// 取得
.get('/debts', async (c) => {
  const db = drizzle(c.env.DB)
  const auth = getAuth(c.env.DB, c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const allDebts = await db.select().from(debts).where(eq(debts.userId, session.user.id)).all()
  return c.json(allDebts)
})

// 作成
.post('/debts', zValidator('json', insertDebtSchema), async (c) => {
  const body = c.req.valid('json')
  const db = drizzle(c.env.DB)

  const auth = getAuth(c.env.DB, c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }


  const newDebt = {
    id: crypto.randomUUID(),
    title: body.title,
    amount: body.amount,
    creditor: body.creditor,
    dueDate: body.dueDate || null,
    status: 'unpaid' as const,
    userId: session.user.id, 
    createdAt: new Date(),
  }

  await db.insert(debts).values(newDebt).run()

  return c.json(newDebt, 201)
})

// 更新
.put('/debts/:id', zValidator('json', insertDebtSchema), async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = c.req.valid('json')

  const auth = getAuth(c.env.DB, c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db.update(debts)
    .set({
      title: body.title,
      amount: body.amount,
      creditor: body.creditor,
      dueDate: body.dueDate || null,
    })
    .where(and(eq(debts.id, id), eq(debts.userId, session.user.id)))
    .run()
  
  return c.json({ success: true })
})

// 削除
.delete('/debts/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
 
  const auth = getAuth(c.env.DB, c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await db.delete(debts)
    .where(and(eq(debts.id, id), eq(debts.userId, session.user.id)))
    .run()

  return c.json({ success: true })
})

// 返済完了ステータスの更新
  .patch('/debts/:id/pay', zValidator('json', z.object({ status: z.enum(['paid', 'unpaid']),})), async (c) => {
    const id = c.req.param('id')
    const { status } = c.req.valid('json')
    const db = drizzle(c.env.DB)

    const auth = getAuth(c.env.DB, c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    
    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    await db.update(debts)
      .set({ status })
      .where(and(eq(debts.id, id), eq(debts.userId, session.user.id)))
      .run()

    return c.json({ success: true })
  })

export type AppType = typeof routes
export default app
