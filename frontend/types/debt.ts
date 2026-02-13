export interface Debt {
  id: string;
  title: string;
  amount: number;
  creditor: string;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue';
}