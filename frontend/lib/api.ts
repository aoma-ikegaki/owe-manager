import { hc } from 'hono/client'
import type { AppType } from '../../backend/src/index'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

const fetchWithCredentials = (input: RequestInfo | URL, init?: RequestInit) => {
  return fetch(input, {
    ...init,
    credentials: 'include',
  })
}

export const client = hc<AppType>(BASE_URL, {
  headers: {
    'Content-Type': 'application/json',
  },
  fetch: fetchWithCredentials,
})