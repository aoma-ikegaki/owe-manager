import { z } from "zod";

export const insertDebtSchema = z.object({
  title: z.string()
    .min(1, "タイトルを入力してください")
    .max(50, "タイトルは50文字以内で入力してください"),
  amount: z.number()
    .positive("金額は0より大きい数値を入力してください")
    .max(10000000, "金額が大きすぎます（1000万円まで）"),
  creditor: z.string()
    .min(1, "貸主を入力してください"),
  dueDate: z.string().optional().nullable(),
});

export type InsertDebt = z.infer<typeof insertDebtSchema>;