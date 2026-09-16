import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile, UserSummary } from '../models/user.model';
import { RequestCacheService } from './request-cache.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient, private readonly cache: RequestCacheService) {}

  list(refresh = false): Observable<UserSummary[]> {
    return this.cache.get('users', () => this.http.get<UserSummary[]>(this.baseUrl), refresh);
  }

  get(id: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/${id}`);
  }

  create(payload: Partial<UserProfile> & { password?: string }): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.baseUrl, payload).pipe(tap(() => this.cache.invalidate('users')));
  }

  update(id: number, payload: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/${id}`, payload).pipe(tap(() => this.cache.invalidate('users')));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(tap(() => this.cache.invalidate('users')));
  }
}
