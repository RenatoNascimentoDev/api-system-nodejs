export type Result<T, E extends string> =
  | { ok: true; value: T }
  | { ok: false; error: E }

export function success<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

export function failure<E extends string>(error: E): Result<never, E> {
  return { ok: false, error }
}
