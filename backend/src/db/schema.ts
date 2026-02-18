import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { z } from "zod";

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

export const insertDebtSchema = z.object({
  title: z.string()
  .min(1, "タイトルを入力してください")
  .max(50, "タイトルは50文字以内で入力してください"),
  amount: z.number()
  .positive("金額は0より大きい数値を入力してください")
  .max(10000000, "金額が大きすぎます(1000万円まで)"),
  creditor: z.string()
  .min(1, "貸主を入力してください"),
  dueDate: z.string().optional().nullable(),
});

export type InsertDebt = z.infer<typeof insertDebtSchema>;
export type Debt = typeof debts.$inferSelect
export type NewDebt = typeof debts.$inferInsert