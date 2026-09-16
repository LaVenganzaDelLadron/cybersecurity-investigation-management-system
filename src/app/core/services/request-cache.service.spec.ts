import { firstValueFrom, NEVER, of, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { RequestCacheService } from './request-cache.service';

describe('RequestCacheService', () => {
  it('reuses a fresh response and refreshes after expiry', async () => {
    vi.useFakeTimers();
    try {
      const cache = new RequestCacheService();
      let requests = 0;
      const request = () => of(++requests);

      expect(await firstValueFrom(cache.get('incidents', request))).toBe(1);
      expect(await firstValueFrom(cache.get('incidents', request))).toBe(1);
      expect(requests).toBe(1);

      vi.advanceTimersByTime(60_001);
      expect(await firstValueFrom(cache.get('incidents', request))).toBe(2);
      expect(requests).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('shares an in-flight request and invalidates matching resource keys', async () => {
    const cache = new RequestCacheService();
    const response = new Subject<string>();
    let requests = 0;
    const request = () => {
      requests += 1;
      return response.asObservable();
    };

    const first = firstValueFrom(cache.get('attachments:42', request));
    const second = firstValueFrom(cache.get('attachments:42', request));
    expect(requests).toBe(1);
    response.next('loaded');
    response.complete();
    await expect(first).resolves.toBe('loaded');
    await expect(second).resolves.toBe('loaded');

    cache.invalidate('attachments');
    await expect(firstValueFrom(cache.get('attachments:42', () => of('fresh')))).resolves.toBe('fresh');
  });

  it('supports explicit refresh and clearing all entries', async () => {
    const cache = new RequestCacheService();
    let requests = 0;
    const request = () => of(++requests);

    await firstValueFrom(cache.get('users', request));
    await firstValueFrom(cache.get('users', request, true));
    expect(requests).toBe(2);
    cache.clear();
    await firstValueFrom(cache.get('users', request));
    expect(requests).toBe(3);
  });

  it('times out a request that never responds', async () => {
    vi.useFakeTimers();
    try {
      const cache = new RequestCacheService();
      const result = firstValueFrom(cache.get('slow', () => NEVER));
      const rejection = expect(result).rejects.toMatchObject({ name: 'TimeoutError' });
      vi.advanceTimersByTime(10_001);
      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });
});
