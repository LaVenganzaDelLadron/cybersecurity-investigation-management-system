import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestCacheService } from './request-cache.service';
import { environment } from '../../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  UserProfile,
  UserRole,
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'cims_access_token';
  private readonly userKey = 'cims_user';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly currentUserSubject = new BehaviorSubject<UserProfile | null>(this.getStoredUser());

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient, private readonly cache: RequestCacheService) {}

  login(payload: LoginRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signin`, payload).pipe(
      tap((response) => this.storeAuth(response))
    );
  }

  signup(payload: SignupRequest) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signup`, payload).pipe(
      tap((response) => this.storeAuth(response))
    );
  }

  logout(): void {
    this.cache.clear();
    this.storage?.removeItem(this.tokenKey);
    this.storage?.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return this.storage?.getItem(this.tokenKey) ?? null;
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole | UserRole[]): boolean {
    const user = this.getCurrentUser();
    const roles = Array.isArray(role) ? role : [role];
    return !!user && roles.includes(user.role);
  }

  private storeAuth(response: AuthResponse): void {
    const token = response.access_token ?? response.token ?? null;
    if (token) {
      this.storage?.setItem(this.tokenKey, token);
    }

    const user = response.user ?? this.decodeToken(token);
    if (user) {
      this.storage?.setItem(this.userKey, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  private decodeToken(token: string | null): UserProfile | null {
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return {
        email: decoded.email ?? decoded.username ?? 'user@cims.local',
        role: (decoded.role ?? decoded.user_role ?? 'user') as UserRole,
        name: decoded.name ?? decoded.full_name ?? 'CIMS User',
      };
    } catch {
      return null;
    }
  }

  private getStoredUser(): UserProfile | null {
    const raw = this.storage?.getItem(this.userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }

  private get storage(): Storage | null {
    return isPlatformBrowser(this.platformId) ? localStorage : null;
  }
}
