export class Storage {
  private static memoryStore: Map<string, string> = new Map();

  static getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fallback to memory store if localStorage is blocked / throws security error
    }
    return this.memoryStore.get(key) ?? null;
  }

  static setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fallback
    }
    this.memoryStore.set(key, value);
  }

  static getNumber(key: string, defaultValue: number = 0): number {
    const val = this.getItem(key);
    if (val === null) return defaultValue;
    const parsed = Number(val);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }

  static setNumber(key: string, value: number): void {
    this.setItem(key, String(value));
  }

  static getBoolean(key: string, defaultValue: boolean = false): boolean {
    const val = this.getItem(key);
    if (val === null) return defaultValue;
    return val === 'true';
  }

  static setBoolean(key: string, value: boolean): void {
    this.setItem(key, value ? 'true' : 'false');
  }
}
