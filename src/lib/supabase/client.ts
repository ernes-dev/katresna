// Drop-in replacement for the old supabase browser client, backed by our API.
'use client'
import { makeFrom } from '@/lib/query-builder'
import type { QueryDesc, ExecResult } from '@/lib/pg-exec'

async function clientExec(desc: QueryDesc): Promise<ExecResult> {
  try {
    const r = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(desc),
    })
    const j = await r.json()
    return j as ExecResult
  } catch (e: any) {
    return { data: null, error: { message: e?.message || 'network error' }, count: null }
  }
}

async function postJson(url: string, body: any) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return r.json()
}

export function createClient() {
  return {
    from: makeFrom(clientExec),
    auth: {
      async getUser() {
        try {
          const r = await fetch('/api/auth/me')
          const j = await r.json()
          return { data: { user: j.user ?? null }, error: j.user ? null : { message: 'no session' } }
        } catch (e: any) {
          return { data: { user: null }, error: { message: e?.message } }
        }
      },
      async signInWithPassword({ email, password }: { email: string; password: string }) {
        const j = await postJson('/api/auth/login', { email, password })
        if (j.error) return { data: { user: null }, error: { message: j.error } }
        return { data: { user: j.user }, error: null }
      },
      async signUp({ email, password }: { email: string; password: string }) {
        const j = await postJson('/api/auth/register', { email, password })
        if (j.error) return { data: { user: null }, error: { message: j.error } }
        return { data: { user: j.user }, error: null }
      },
      async signOut() {
        await postJson('/api/auth/logout', {})
        return { error: null }
      },
    },
    storage: {
      from(bucket: string) {
        return {
          async upload(path: string, file: File | Blob, _opts?: any) {
            const fd = new FormData()
            fd.append('bucket', bucket)
            fd.append('path', path)
            fd.append('file', file)
            const r = await fetch('/api/storage/upload', { method: 'POST', body: fd })
            const j = await r.json()
            if (j.error) return { data: null, error: { message: j.error } }
            return { data: { path: j.path }, error: null }
          },
          getPublicUrl(path: string) {
            return { data: { publicUrl: `/uploads/${bucket}/${path}` } }
          },
          async createSignedUrl(path: string, _expiresIn?: number) {
            return { data: { signedUrl: `/uploads/${bucket}/${path}` }, error: null }
          },
          async remove(paths: string[]) {
            const j = await postJson('/api/storage/delete', { bucket, paths })
            return { data: j.data ?? null, error: j.error ? { message: j.error } : null }
          },
        }
      },
    },
  }
}
