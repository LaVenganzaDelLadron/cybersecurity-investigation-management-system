import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { UserSummary } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

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

  constructor(private readonly userService: UserService) {
    this.userService.list().subscribe({
      next: (users) => (this.users = users),
      error: () => {
        this.error = 'Unable to load users.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
