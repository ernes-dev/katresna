import type { QueryDesc, ExecResult, FilterOp } from './pg-exec'

export type Executor = (desc: QueryDesc) => Promise<ExecResult>

export class QueryBuilder implements PromiseLike<ExecResult> {
  desc: QueryDesc
  constructor(private exec: Executor, table: string) {
    this.desc = { table, action: 'select', filters: [] }
  }
  select(cols = '*', opts?: { count?: string; head?: boolean }) {
    if (this.desc.action === 'select') this.desc.select = cols
    if (opts?.head) this.desc.head = true
    if (opts?.count) this.desc.count = true
    return this
  }
  insert(values: any) { this.desc.action = 'insert'; this.desc.values = values; return this }
  update(values: any) { this.desc.action = 'update'; this.desc.values = values; return this }
  delete() { this.desc.action = 'delete'; return this }

  private f(col: string, op: FilterOp, val: any) { this.desc.filters!.push({ col, op, val }); return this }
  eq(c: string, v: any) { return this.f(c, 'eq', v) }
  neq(c: string, v: any) { return this.f(c, 'neq', v) }
  gte(c: string, v: any) { return this.f(c, 'gte', v) }
  lte(c: string, v: any) { return this.f(c, 'lte', v) }
  gt(c: string, v: any) { return this.f(c, 'gt', v) }
  lt(c: string, v: any) { return this.f(c, 'lt', v) }
  is(c: string, v: any) { return this.f(c, 'is', v) }
  in(c: string, v: any[]) { return this.f(c, 'in', v) }

  order(col: string, opts?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.desc.order = { col, ascending: opts?.ascending !== false }
    return this
  }
  limit(n: number) { this.desc.limit = n; return this }
  single() { this.desc.single = true; return this }
  maybeSingle() { this.desc.maybeSingle = true; return this }

  then<R1 = ExecResult, R2 = never>(
    onF?: ((v: ExecResult) => R1 | PromiseLike<R1>) | null,
    onR?: ((r: any) => R2 | PromiseLike<R2>) | null,
  ): PromiseLike<R1 | R2> {
    return this.exec(this.desc).then(onF, onR)
  }
}

export function makeFrom(exec: Executor) {
  return (table: string) => new QueryBuilder(exec, table)
}
