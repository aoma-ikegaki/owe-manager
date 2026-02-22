import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { drizzle } from 'drizzle-orm/d1'
import { debts } from './db/schema'
import { eq } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { insertDebtSchema } from './db/schema'


type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors({
  origin: (origin) => {
    if (origin === 'http://localhost:3000' || origin.endsWith('.pages.dev')) {
      return origin;
    }
    return 'http://localhost:3000';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}))
const routes = app.basePath('/api')

// 取得
.get('/debts', async (c) => {
  const db = drizzle(c.env.DB)

  const allDebts = await db.select().from(debts).all()
  return c.json(allDebts)
})

// 作成
.post('/debts', zValidator('json', insertDebtSchema), async (c) => {
  const body = c.req.valid('json')

  const db = drizzle(c.env.DB)

  const newDebt = {
    id: crypto.randomUUID(),
    title: body.title,
    amount: body.amount,
    creditor: body.creditor,
    dueDate: body.dueDate || null,
    status: 'unpaid' as const,
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

  await db.update(debts)
    .set({
      title: body.title,
      amount: body.amount,
      creditor: body.creditor,
      dueDate: body.dueDate || null,
    })
    .where(eq(debts.id, id))
    .run()
  
  return c.json({ success: true })
})

// 削除
.delete('/debts/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
 
  await db.delete(debts)
    .where(eq(debts.id, id))
    .run()

  return c.json({ success: true })
})

// 返済完了ステータスの更新
.patch('/debts/:id/pay', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const body = await c.req.json<{ status: 'paid' | 'unpaid' }>()

  await db.update(debts)
    .set({ status: body.status })
    .where(eq(debts.id, id))
    .run()

  return c.json({ success: true })
})

export type AppType = typeof routes
export default app
