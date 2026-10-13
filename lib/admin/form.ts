/** Small helpers for reading FormData in server actions. Everything arrives as a string. */
export const str = (fd: FormData, key: string): string => String(fd.get(key) ?? '').trim()

export const bool = (fd: FormData, key: string): boolean => fd.get(key) === 'on' || fd.get(key) === 'true'

/** Parses an integer; returns `fallback` for empty/invalid input so zod can reject out-of-range values. */
export function int(fd: FormData, key: string, fallback: number): number {
  const raw = str(fd, key).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  return /^-?\d+$/.test(raw) ? Number(raw) : fallback
}

export function localized(fd: FormData, prefix: string): {ar: string; en: string} {
  return {ar: str(fd, `${prefix}Ar`), en: str(fd, `${prefix}En`)}
}

export function jsonField<T>(fd: FormData, key: string, fallback: T): T {
  try {
    return JSON.parse(str(fd, key)) as T
  } catch {
    return fallback
  }
}
