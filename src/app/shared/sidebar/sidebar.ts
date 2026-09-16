import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import type { UserRole } from '../../types';

interface SidebarItem {
  label: string;
  route: string;
  roles: UserRole[];
}

@Component({
  imports: [CommonModule, RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser$ = this.authService.currentUser$;
  isOpen = false;

  readonly items: SidebarItem[] = [
    { label: 'Dashboard', route: '/dashboard', roles: ['admin', 'analyst', 'user'] },
    { label: 'Incidents', route: '/incidents', roles: ['admin', 'analyst', 'user'] },
    { label: 'Report incident', route: '/incidents/new', roles: ['admin', 'analyst', 'user'] },
    { label: 'Categories', route: '/categories', roles: ['admin'] },
    { label: 'Investigation notes', route: '/notes', roles: ['admin', 'analyst'] },
    { label: 'Attachments', route: '/attachments', roles: ['admin', 'analyst', 'user'] },
    { label: 'AI assistant', route: '/chat', roles: ['admin', 'analyst', 'user'] },
    { label: 'Users and roles', route: '/users', roles: ['admin'] },
    { label: 'Audit logs', route: '/audit-logs', roles: ['admin'] },
    { label: 'Profile', route: '/profile', roles: ['admin', 'analyst', 'user'] },
  ];

  visibleItems(role: UserRole | undefined): SidebarItem[] {
    return this.items.filter((item) => !!role && item.roles.includes(role));
  }

  closeMenu(): void {
    this.isOpen = false;
  }

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    void this.router.navigateByUrl('/login');
  }
}
