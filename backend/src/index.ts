import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { drizzle } from 'drizzle-orm/d1'
import { debts } from './db/schema'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

const routes = app.basePath('/api')

.get('/debts', async (c) => {
  const db = drizzle(c.env.DB)

  const allDebts = await db.select().from(debts).all()
  return c.json(allDebts)
})

.post('/debts', async (c) => {
  const db = drizzle(c.env.DB)

  const body = await c.req.json<{
    title: string;
    amount: number;
    creditor: string;
    dueDate: string;
  }>()

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

export type AppType = typeof routes
export default app
