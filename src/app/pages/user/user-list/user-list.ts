import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserSummary } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './user-list.css',
  templateUrl: './user-list.html',
})
export class UserList {
  users: UserSummary[] = [];
  loading = true;
  error = '';
  actionError = '';
  deleting = false;
  canManage = false;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    this.canManage = this.authService.hasRole('admin');
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.userService.list().subscribe({
      next: (users) => (this.users = users),
      error: () => {
        this.error = 'Unable to load users.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  create(): void { this.router.navigateByUrl('/users/new'); }
  edit(id: number): void { this.router.navigate(['/users', id, 'edit']); }

  remove(user: UserSummary): void {
    if (!this.canManage || this.deleting || !window.confirm(`Delete ${user.email}?`)) return;
    this.deleting = true;
    this.actionError = '';
    this.userService.delete(user.id).subscribe({
      next: () => (this.users = this.users.filter((item) => item.id !== user.id)),
      error: () => { this.actionError = 'Unable to delete the user.'; this.deleting = false; },
      complete: () => (this.deleting = false),
    });
  }
}
