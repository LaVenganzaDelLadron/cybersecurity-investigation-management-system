import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  readonly stats = [
    { label: 'Open Incidents', value: 42, tone: 'accent' },
    { label: 'Investigating', value: 18, tone: 'warning' },
    { label: 'Resolved', value: 67, tone: 'success' },
    { label: 'Critical Alerts', value: 6, tone: 'danger' },
  ];

  role = 'user';

  constructor(private readonly authService: AuthService) {
    this.role = this.authService.getCurrentUser()?.role ?? 'user';
  }
}
