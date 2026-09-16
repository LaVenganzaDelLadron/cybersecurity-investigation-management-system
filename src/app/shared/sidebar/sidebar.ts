import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import type { UserRole } from '../../types';

interface SidebarItem {
  label: string;
  route: string;
  roles?: UserRole[];
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
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Incidents', route: '/incidents' },
    { label: 'New incident', route: '/incidents/new' },
    { label: 'Categories', route: '/categories' },
    { label: 'Investigation notes', route: '/notes', roles: ['admin', 'analyst'] },
    { label: 'Attachments', route: '/attachments' },
    { label: 'AI assistant', route: '/chat' },
    { label: 'Users', route: '/users', roles: ['admin'] },
    { label: 'Audit logs', route: '/audit-logs', roles: ['admin'] },
    { label: 'Profile', route: '/profile' },
  ];

  visibleItems(role: UserRole | undefined): SidebarItem[] {
    return this.items.filter((item) => !item.roles || (!!role && item.roles.includes(role)));
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
