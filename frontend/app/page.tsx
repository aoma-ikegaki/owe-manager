"use client";

import React, { useState } from 'react';

// 型定義
export interface Debt {
  id: string;
  title: string;
  amount: number;
  creditor: string;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue';
}

// モックデータ
const INITIAL_DEBTS: Debt[] = [
  { id: '1', title: '飲み会代', amount: 3000, creditor: '田中', dueDate: '2026-02-10', status: 'unpaid' },
  { id: '2', title: '旅行代', amount: 15000, creditor: '佐藤', dueDate: '2026-03-20', status: 'unpaid' },
];

export default function OweManager() {
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS);
  const today = new Date();

  const handlePay = (id: string) => {
    const updatedDebts = debts.map(debt => 
      debt.id === id ? { ...debt, status: 'paid' as const } : debt
    );
    setDebts(updatedDebts);
  };

  const totalUnpaidAmount = debts
    .filter(debt => debt.status !== 'paid')
    .reduce((sum, debt) => sum + debt.amount, 0);

  return (
    <div>
      <h1>OweManager</h1>

      <section>
        <h2>合計未返済額</h2>
        <p>{totalUnpaidAmount.toLocaleString()} 円</p>
      </section>

      <hr />

      <section>
        <h2>一覧</h2>
        <ul>
          {debts.map((debt) => {
            const isOverdue = new Date(debt.dueDate) < today && debt.status !== 'paid';
            
            return (
              <li key={debt.id}>
                <div>
                  <strong>{debt.title}</strong>
                  <span>（貸主: {debt.creditor}）</span>
                  <span> [{isOverdue ? 'overdue' : debt.status}]</span>
                </div>
                <div>
                  金額: {debt.amount.toLocaleString()} 円 / 期限: {debt.dueDate}
                </div>
                
                {debt.status !== 'paid' && (
                  <button onClick={() => handlePay(debt.id)}>
                    返済完了にする
                  </button>
                )}
                
                {isOverdue && <b style={{ color: 'red' }}>【至急返済！】</b>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}