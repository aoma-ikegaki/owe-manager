"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/lib/api";
import type { Debt } from "@/types/debt";
import { InsertDebt, insertDebtSchema } from "@/lib/schemas";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export default function OweManager() {
  const queryClient = useQueryClient();
  
  const [session, setSession] = useState<typeof authClient.$Infer.Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const sessionData = await authClient.getSession();
      setSession(sessionData.data);
      setAuthLoading(false);
    };

    initAuth();
  }, []);

  const { data: debts = [], isLoading } = useQuery({
    queryKey: ["debts", session?.user?.id],
    queryFn: async () => {
      const res = await client.api.debts.$get();
      if (!res.ok) throw new Error("データの取得に失敗しました");
      return (await res.json()) as unknown as Debt[];
    },
    enabled: !!session, 
  });

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [creditor, setCreditor] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const clearForm = () => {
    setTitle("");
    setAmount("");
    setCreditor("");
    setDueDate("");
    setEditingId(null);
  };

  const createMutation = useMutation({
    mutationFn: async (newData: InsertDebt) => {
      const res = await client.api.debts.$post({ json: newData });
      if (!res.ok) throw new Error("作成に失敗しました");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      toast.success("借金が登録されました");
      clearForm();
    },
    onError: () => {
      toast.error("登録できませんでした。入力内容を確認してください。");
    } 
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, json }: { id: string; json: InsertDebt }) => {
      return await client.api.debts[":id"].$put({
        param: { id },
        json: json,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      clearForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.debts[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error("削除に失敗しました");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      toast.success("削除が完了しました");
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "paid" | "unpaid" }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
      const res = await fetch(`${baseUrl}/api/debts/${id}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("ステータスの更新に失敗しました");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = insertDebtSchema.safeParse({
      title,
      amount: Number(amount),
      creditor,
      dueDate: dueDate || undefined,
    });

    if (!result.success) {
      alert(result.error.issues[0].message);
      return;
    }

    createMutation.mutate(result.data);
  };

  // 編集ボタンを押したときに呼ばれる関数
  const handleEdit = (debt: Debt) => {
    setEditingId(debt.id);
    setTitle(debt.title);
    setAmount(String(debt.amount)); //inputは文字列を扱うのでStringに変換する
    setCreditor(debt.creditor);
    setDueDate(debt.dueDate || "");
  };

  // 更新ボタンを押したときに呼ばれる関数
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const result = insertDebtSchema.safeParse({
      title,
      amount: Number(amount),
      creditor,
      dueDate: dueDate || undefined,
    });

    if (!result.success) {
      alert(result.error.issues[0].message);
      return;
    }

    updateMutation.mutate({
      id: editingId,
      json: result.data,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("本当に削除しますか？")) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePay = async (debt: Debt) => {
    const nextStatus = debt.status === "paid" ? "unpaid" : "paid";
    toggleStatusMutation.mutate({ id: debt.id, status: nextStatus });
  };

  const unpaidDebts = debts.filter((debt) => debt.status === "unpaid");

  const paidDebts = debts.filter((debt) => debt.status === "paid");

  const totalAmount = unpaidDebts.reduce((sum, debt) => sum + debt.amount, 0);

  const handleGoogleLogin = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: window.location.origin + "/",
    });
    if (error) {
      toast.error(`ログインエラー: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setSession(null);
  };

  if (authLoading) return <div className="p-10 text-center">Loading...</div>;

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-md p-10 flex flex-col items-center gap-6 w-full max-w-sm">
          <h1 className="text-3xl font-bold text-gray-900">OweManager</h1>
          <p className="text-gray-500 text-center text-sm">「誰に、いくら、いつまでに」返すべきかを明確に</p>
          <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-3 bg-white border border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow transition-all w-full justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Googleでログイン
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto ">
      <div className="flex justify-between items-center py-5">
        <h1 className="text-4xl font-bold">OweManager</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          ログアウト
        </button>
      </div>
      <p className="text-center text-gray-500">「誰に、いくら、いつまでに」返すべきかを明確に</p>
      <section className="mt-3 mb-3 p-4 rounded-2xl text-center bg-gray-50 shadow-sm rounded-xl">
        <h2 className="font-bold uppercase tracking-widest mb-1">現在の合計未返済額</h2>
        <div className="text-4xl font-bold">
          {totalAmount.toLocaleString()}円
        </div>
        <div className="mt-2 text-gray-700">
          残り<span className="font-bold text-red-500 text-lg">{unpaidDebts.length}件</span>の借金があります
        </div>
      </section>

      <form
        onSubmit={editingId ? handleUpdate : handleSubmit}
        className="p-6 bg-gray-50 rounded-xl space-y-4 shadow-sm my-6"
      >
        <h2 className="text-xl font-bold text-gray-sm uppercase text-center">
          {editingId ? "編集中" : "新規作成"}
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <input
            className="border p-2 rounded"
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="金額"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            className="border p-2 rounded"
            type="text"
            placeholder="貸主"
            value={creditor}
            onChange={(e) => setCreditor(e.target.value)}
            required
          />
          <input
            className="border p-2 rounded"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 font-bold rounded hover:bg-blue-600 transition-colors shadow"
            type="submit"
          >
            {editingId ? "更新する" : "登録する"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={clearForm}
              className="bg-gray-500 text-white px-4 py-2 font-bold rounded hover:bg-gray-600 transition-colors shadow"
            >
              キャンセル
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2 text-center">
            未返済：
            <span>({unpaidDebts.length})</span>
          </h2>
          {unpaidDebts.length === 0 ? (
            <p className="text-center">現在、借金はありません！</p>
          ) : (
            unpaidDebts.map((debt) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const dueDate = debt.dueDate ? new Date(debt.dueDate) : null;
              const isOverdue = dueDate && dueDate < today;

              return (
              <div
                key={debt.id}
                className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-gray-900 py-1">{debt.title}</p>
                  {isOverdue && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">期限切れ</span>)}
                  <p className="text-xl font-bold py-1">
                    金額： <span className="text-red-500">{debt.amount}円</span>
                  </p>
                  <p className="text-sm text-gray-600 font-bold py-1">
                    貸主： {debt.creditor}さん / 期限：{" "}
                    {debt.dueDate || "未設定"}
                  </p>
                  <div>
                    <button
                      onClick={() => handleEdit(debt)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 mr-2 mt-2 rounded hover:bg-blue-400"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(debt.id)}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-400"
                    >
                      削除
                    </button>
                    <button
                      onClick={() => handleTogglePay(debt)}
                      className={`px-3 py-1 ml-2 text-white rounded-full text-xs font-bold transition-colors ${debt.status === "paid" ? "bg-green-500 text-green-700 hover:bg-green-400" : "bg-gray-600 hover:bg-indigo-100 hover:text-indigo-700"}`}
                    >
                      {debt.status === "paid" ? "完了" : "返済完了にする"}
                    </button>
                  </div>
                </div>
              </div>
            )
            })
          )}

        {paidDebts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold border-b pb-2 text-center">
              返済済み：
              <span>({paidDebts.length})</span>
            </h2>
          <div >
            {paidDebts.map((debt) => (
              <div key={debt.id} className="p-4 border rounded-lg shadow-sm flex justify-between items-center m-3">
                <div>
                  <p className="font-bold text-gray-600 py-1">{debt.title}</p>
                  <p className="text-xl font-bold text-gray-600">金額：{debt.amount}円</p>
                  <p className="text-sm text-gray-600 py-1">貸主：{debt.creditor}さん</p>
                </div>
                <button onClick={() => handleTogglePay(debt)} className="text-xs bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-500">戻す</button>
              </div>
            ))}
          </div>
          </section>
        )}
      </div>
    </div>
  );
}
