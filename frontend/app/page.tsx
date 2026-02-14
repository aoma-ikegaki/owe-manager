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

  const [editingId, setEditingId] = useState<string | null>(null);
  
  const clearForm = () => {
    setTitle('');
    setAmount('');
    setCreditor('');
    setDueDate('');
    setEditingId(null);
  };

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
      clearForm();
      await fetchDebts();
    }
  };

  // 編集ボタンを押したときに呼ばれる関数
  const handleEdit = (debt: Debt) => {
    setEditingId(debt.id);
    setTitle(debt.title);
    setAmount(String(debt.amount)); //inputは文字列を扱うのでStringに変換する
    setCreditor(debt.creditor);
    setDueDate(debt.dueDate || '');
  };

  // 更新ボタンを押したときに呼ばれる関数
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    // バックエンドにPUTリクエストを送る
    const res = await client.api.debts[':id'].$put({
      param: { id: editingId },
      json: { title, amount: Number(amount), creditor, dueDate: dueDate || undefined }
    });
    if (res.ok) {
      clearForm();
      await fetchDebts();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await client.api.debts[':id'].$delete({ param: { id } });
    if (res.ok) {
      await fetchDebts();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-xl mx-auto ">
      <h1 className="text-3xl font-bold text-center py-5">借金管理アプリ</h1>
      <p className="text-center text-gray-500">一刻でも早く返済してください</p>
      <form onSubmit={editingId ? handleUpdate : handleSubmit} className="p-6 bg-gray-50 rounded-xl space-y-4 shadow-sm my-6">
        <h2 className="text-xl font-bold text-gray-sm uppercase text-center">{editingId ? '編集中' : '新規作成'}</h2>
        <div className="grid grid-cols-1 gap-3">
          <input className="border p-2 rounded" type="text" placeholder='何のお金？' value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input className="border p-2 rounded" type="number" placeholder='金額' value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <input className="border p-2 rounded" type="text" placeholder='貸主' value={creditor} onChange={(e) => setCreditor(e.target.value)} required />
          <input className="border p-2 rounded" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <button className="bg-blue-500 text-white px-4 py-2 font-bold rounded hover:bg-blue-600 transition-colors shadow" type="submit">{editingId ? '更新する' : '登録する'}</button>
          {editingId && (
            <button type='button' onClick={clearForm} className="bg-gray-500 text-white px-4 py-2 font-bold rounded hover:bg-gray-600 transition-colors shadow">キャンセル</button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-bold border-b pb-2 text-center">未返済リスト</h2>
        {debts.length === 0 ? (
          <p className="text-center">現在、借金はありません！</p>
        ) : (
          debts.map((debt) => (
            <div key={debt.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900 py-1">{debt.title}</p>
                <p className="text-xl font-bold py-1">金額： <span className="text-red-500">{debt.amount}円</span></p>
                <p className="text-sm text-gray-500 font-bold py-1">貸主： {debt.creditor}さん/ 期限： {debt.dueDate || '未設定'}</p>
                <div>
                  <button onClick={() => handleEdit(debt)} className="text-xs bg-blue-500 text-white px-2 py-1 mr-2 mt-2 rounded hover:bg-blue-600">編集</button>
                  <button onClick={() => handleDelete(debt.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">削除</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}