import { describe, it, expect } from 'vitest';
import { Storage } from '../../src/client/storage';

describe('Storage Wrapper', () => {
  it('reads and writes numbers and booleans safely even without browser localStorage', () => {
    Storage.setNumber('test_num', 42);
    expect(Storage.getNumber('test_num', 0)).toBe(42);

    Storage.setBoolean('test_bool', true);
    expect(Storage.getBoolean('test_bool', false)).toBe(true);

    Storage.setBoolean('test_bool', false);
    expect(Storage.getBoolean('test_bool', true)).toBe(false);

    expect(Storage.getNumber('missing_key', 100)).toBe(100);
    expect(Storage.getBoolean('missing_bool', true)).toBe(true);
  });
});
