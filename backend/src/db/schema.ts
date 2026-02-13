import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const debts = sqliteTable('debts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  amount: integer('amount').notNull(),
  creditor: text('creditor').notNull(),
  dueDate: text('du_date'),
  status: text('status', { enum: ['unpaid', 'paid', 'overdue'] })
  .notNull()
  .default('unpaid'),

  createdAt: integer('created_at', { mode: 'timestamp' })
  .notNull()
  .default(new Date()),
});

export type Debt = typeof debts.$inferSelect
export type NewDebt = typeof debts.$inferInsert