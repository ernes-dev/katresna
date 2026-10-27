// Drop-in replacement for the old supabase server client, backed by Postgres.
import { execQuery } from '@/lib/pg-exec'
import { makeFrom } from '@/lib/query-builder'
import { getSession } from '@/lib/auth'
import { query as dbQuery } from '@/lib/db'

export async function createClient() {
  return {
    from: makeFrom(execQuery),
    auth: {
      async getUser() {
        const s = await getSession()
        if (!s) return { data: { user: null }, error: null }
        return { data: { user: { id: s.uid, email: s.email } }, error: null }
      },
    },
    storage: {
      from(_bucket: string) {
        return {
          getPublicUrl(path: string) {
            return { data: { publicUrl: `/uploads/${_bucket}/${path}` } }
          },
        }
      },
    },
    // raw escape hatch
    _query: dbQuery,
  }
}
