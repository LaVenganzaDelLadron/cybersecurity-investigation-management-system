import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
  user: { email: string; role: string; name: string };

  constructor(private readonly authService: AuthService) {
    const currentUser = this.authService.getCurrentUser();
    this.user = currentUser
      ? {
          email: currentUser.email ?? 'user@cims.local',
          role: currentUser.role ?? 'user',
          name: currentUser.name ?? currentUser.full_name ?? 'CIMS User',
        }
      : { email: 'user@cims.local', role: 'user', name: 'CIMS User' };
  }
}
