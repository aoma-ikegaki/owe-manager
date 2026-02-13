"use client";

import React, { useEffect, useState } from 'react';
import { client } from '@/lib/api';
import type { Debt } from '../../backend/src/db/schema';

export default function OweManager() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [creditor, setCreditor] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  const fetchDebts = async () => {
    const res = await client.api.debts.$get();
    if (res.ok) {
      const data = await res.json();
      setDebts(data as unknown as Debt[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await client.api.debts.$post({
      json: {
        title,
        amount: Number(amount),
        creditor,
        dueDate: dueDate || undefined,
      }
    });

    if (res.ok) {
      setTitle('');
      setAmount('');
      setCreditor('');
      setDueDate('');
      fetchDebts();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Owe Manager</h1>

      <form onSubmit={handleSubmit}>
        <h2>新規登録</h2>
        <div>
          <input type="text" placeholder='何のお金？' value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="number" placeholder='金額' value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <input type="text" placeholder='貸主' value={creditor} onChange={(e) => setCreditor(e.target.value)} required />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <button type="submit">登録</button>
        </div>
      </form>

      <div>
        <h2>未返済リスト</h2>
        {debts.length === 0 ? (
          <p>現在、借金はありません！</p>
        ) : (
          debts.map((debt) => (
            <div key={debt.id}>
              <div>
                <p>{debt.title}</p>
                <p>金額： {debt.amount}円</p>
                <p>貸主： {debt.creditor} / 期限： {debt.dueDate || '未設定'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}