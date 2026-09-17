import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  canActivate(): boolean | UrlTree {
    if (!isPlatformBrowser(this.platformId)) return true;
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login']);
    }

    return this.authService.hasRole('admin')
      ? true
      : this.router.createUrlTree(['/dashboard']);
  }
}
