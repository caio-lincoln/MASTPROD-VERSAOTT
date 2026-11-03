"use client"

/**
 * Cliente de dados do navegador. Mantém a forma de uso que as telas já tinham
 * (db.from("tabela").select().eq()...), mas fala com /api/data, que executa no
 * PostgreSQL com controle de acesso por empresa (lib/server/data-api.ts).
 */

export interface DataError {
  message: string
}

export interface DataResult<T> {
  data: T | null
  error: DataError | null
}

type Filter = { column: string; op: "eq" | "neq" | "in" | "is"; value: unknown }
type Action = "select" | "insert" | "update" | "delete"

class QueryBuilder<T = any> implements PromiseLike<DataResult<T>> {
  private action: Action = "select"
  private selectCols: string | undefined
  private returning: string | null = null
  private filters: Filter[] = []
  private orders: { column: string; ascending?: boolean }[] = []
  private limitCount: number | undefined
  private values: unknown
  private singleMode: "single" | "maybe" | undefined

  constructor(private table: string) {}

  select(columns = "*"): QueryBuilder<T> {
    if (this.action === "select") this.selectCols = columns
    else this.returning = columns
    return this
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]): QueryBuilder<T> {
    this.action = "insert"
    this.values = values
    return this
  }

  update(values: Record<string, unknown>): QueryBuilder<T> {
    this.action = "update"
    this.values = values
    return this
  }

  delete(): QueryBuilder<T> {
    this.action = "delete"
    return this
  }

  eq(column: string, value: unknown): QueryBuilder<T> {
    this.filters.push({ column, op: "eq", value })
    return this
  }

  neq(column: string, value: unknown): QueryBuilder<T> {
    this.filters.push({ column, op: "neq", value })
    return this
  }

  in(column: string, values: unknown[]): QueryBuilder<T> {
    this.filters.push({ column, op: "in", value: values })
    return this
  }

  is(column: string, value: null): QueryBuilder<T> {
    this.filters.push({ column, op: "is", value })
    return this
  }

  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T> {
    this.orders.push({ column, ascending: options?.ascending })
    return this
  }

  limit(count: number): QueryBuilder<T> {
    this.limitCount = count
    return this
  }

  single(): QueryBuilder<T> {
    this.singleMode = "single"
    return this
  }

  maybeSingle(): QueryBuilder<T> {
    this.singleMode = "maybe"
    return this
  }

  then<R1 = DataResult<T>, R2 = never>(
    onfulfilled?: ((value: DataResult<T>) => R1 | PromiseLike<R1>) | null,
    onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null
  ): PromiseLike<R1 | R2> {
    return this.execute().then(onfulfilled, onrejected)
  }

  private async execute(): Promise<DataResult<T>> {
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: this.table,
          action: this.action,
          select: this.selectCols,
          returning: this.returning,
          filters: this.filters,
          order: this.orders,
          limit: this.limitCount,
          values: this.values,
          single: this.singleMode,
        }),
      })
      const body = await res.json().catch(() => null)
      if (res.status === 401 && typeof window !== "undefined") {
        window.location.href = "/login"
      }
      if (!res.ok) {
        return { data: null, error: { message: body?.error?.message || `Erro HTTP ${res.status}` } }
      }
      return { data: body?.data ?? null, error: null }
    } catch (err) {
      return { data: null, error: { message: err instanceof Error ? err.message : "Falha de rede" } }
    }
  }
}

export const db = {
  from<T = any>(table: string): QueryBuilder<T> {
    return new QueryBuilder<T>(table)
  },
}
