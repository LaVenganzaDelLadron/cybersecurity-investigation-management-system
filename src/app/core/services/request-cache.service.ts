import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { finalize, shareReplay, tap, timeout } from 'rxjs/operators';

interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

@Injectable({ providedIn: 'root' })
export class RequestCacheService {
  private readonly requestTimeoutMs = 10_000;
  private readonly entries = new Map<string, CacheEntry>();
  private readonly pending = new Map<string, Observable<unknown>>();
  private readonly ttlMs = 60_000;

  get<T>(key: string, request: () => Observable<T>, refresh = false): Observable<T> {
    if (refresh) this.invalidate(key);
    const cached = this.entries.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return of(cached.value as T);
    }
    if (cached) this.entries.delete(key);

    const pending = this.pending.get(key);
    if (pending) return pending as Observable<T>;

    const shared = request().pipe(
      timeout({ first: this.requestTimeoutMs }),
      tap((value) => this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs })),
      finalize(() => this.pending.delete(key)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.pending.set(key, shared as Observable<unknown>);
    return shared;
  }

  invalidate(keyPrefix: string): void {
    for (const key of this.entries.keys()) {
      if (key === keyPrefix || key.startsWith(`${keyPrefix}:`)) this.entries.delete(key);
    }
    for (const key of this.pending.keys()) {
      if (key === keyPrefix || key.startsWith(`${keyPrefix}:`)) this.pending.delete(key);
    }
  }

  clear(): void {
    this.entries.clear();
    this.pending.clear();
  }
}
