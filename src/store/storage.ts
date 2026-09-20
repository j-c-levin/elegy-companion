export const STORAGE_PREFIX = 'elegy:'

export function storageKey(name: string): string {
  return STORAGE_PREFIX + name
}

export function readJson<T>(name: string): T | null {
  try {
    const raw = localStorage.getItem(storageKey(name))
    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export function writeJson(name: string, value: unknown): void {
  try {
    localStorage.setItem(storageKey(name), JSON.stringify(value))
  } catch {
    // storage unavailable or full: state stays in memory for the session
  }
}

export function removeKey(name: string): void {
  try {
    localStorage.removeItem(storageKey(name))
  } catch {
    // ignore: treated as absent
  }
}
