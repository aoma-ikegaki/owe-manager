// フロントエンド側でfetchを使えばAPIリクエストを送ることはできるが、このファイルを作成することで、以下のようなメリットがある。
// - 型安全性  
//   バックエンドのAppTypeをインプットしているので、APIのパスやデータの型を間違えると、コンパイルエラーになる。
// - 自動補完
//   client.api.と打つと、APIのエンドポイントが自動補完される。
// - 管理の集約
//   接続先のURLをこのファイルに集約することで、環境変数の管理がしやすくなる。

import { hc } from 'hono/client'
import type { AppType } from '../../backend/src/index'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787' //開発時はローカルのHonoサーバーにリクエスト、本番環境では環境変数を使って、Cloudflare Workers上の本番URLへリクエストする

export const client = hc<AppType>(baseURL)