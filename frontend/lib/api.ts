import { hc } from 'hono/client'
import type { AppType } from '../../backend/src/index'

const productionUrl = process.env.NEXT_PUBLIC_PRODUCTION_URL || 'http://localhost:8787'
export const client = hc<AppType>(productionUrl)