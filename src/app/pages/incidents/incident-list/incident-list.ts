import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../../core/services/incident.service';
import { Incident } from '../../../core/models/incident.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './incident-list.css',
  templateUrl: './incident-list.html',
})
export class IncidentList {
  incidents: Incident[] = [];
  loading = true;
  error = '';
  readonly isAdmin: boolean;

  constructor(
    private readonly incidentService: IncidentService,
    authService: AuthService,
  ) {
    this.isAdmin = authService.hasRole('admin');
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.loading = true;
    this.incidentService.list().subscribe({
      next: (incidents) => (this.incidents = incidents),
      error: () => {
        this.error = 'Unable to load incidents.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  deleteIncident(incident: Incident): void {
    if (!this.isAdmin || !confirm(`Delete "${incident.title}"?`)) {
      return;
    }
    this.incidentService.delete(incident.id).subscribe({
      next: () => (this.incidents = this.incidents.filter((item) => item.id !== incident.id)),
      error: () => (this.error = 'Unable to delete the incident.'),
    });
  }
}
