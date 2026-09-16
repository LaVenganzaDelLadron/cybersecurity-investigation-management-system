import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Incident } from '../../core/models/incident.model';
import { IncidentService } from '../../core/services/incident.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  role = 'user';
  incidents: Incident[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly authService: AuthService,
    private readonly incidentService: IncidentService,
  ) {
    this.role = this.authService.getCurrentUser()?.role ?? 'user';
    this.incidentService.list().subscribe({
      next: (incidents) => (this.incidents = incidents),
      error: () => {
        this.error = 'Unable to load dashboard data.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  get stats() {
    return [
      { label: 'Open Incidents', value: this.incidents.filter((incident) => !['resolved', 'closed'].includes(this.normalise(incident.status))).length, tone: 'accent' },
      { label: 'Investigating', value: this.countByStatus('investigating'), tone: 'warning' },
      { label: 'Resolved', value: this.countByStatus('resolved'), tone: 'success' },
      { label: 'Critical Alerts', value: this.incidents.filter((i) => this.normalise(i.severity) === 'critical').length, tone: 'danger' },
    ];
  }

  get recentIncidents(): Incident[] {
    return [...this.incidents]
      .sort((a, b) => this.dateValue(b.updated_at ?? b.created_at) - this.dateValue(a.updated_at ?? a.created_at))
      .slice(0, 5);
  }

  private countByStatus(status: string): number {
    return this.incidents.filter((incident) => this.normalise(incident.status) === status).length;
  }

  private normalise(value: string | undefined): string {
    return (value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  }

  private dateValue(value?: string): number {
    return value ? new Date(value).getTime() || 0 : 0;
  }
}
