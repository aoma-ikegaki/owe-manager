// フロントエンド側でfetchを使えばAPIリクエストを送ることはできるが、このファイルを作成することで、以下のようなメリットがある。
// - 型安全性  
//   バックエンドのAppTypeをインプットしているので、APIのパスやデータの型を間違えると、コンパイルエラーになる。
// - 自動補完
//   client.api.と打つと、APIのエンドポイントが自動補完される。
// - 管理の集約
//   接続先のURLをこのファイルに集約することで、環境変数の管理がしやすくなる。

import { hc } from 'hono/client'
import type { AppType } from '../../backend/src/index'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

// fetch をラップして credentials を強制的に付与する関数を作成
const fetchWithCredentials = (input: RequestInfo | URL, init?: RequestInit) => {
  return fetch(input, {
    ...init,
    credentials: 'include', // Cookieを含める
  })
}

export const client = hc<AppType>(BASE_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
  // fetch プロパティに自作関数を割り当てる
  fetch: fetchWithCredentials, 
})