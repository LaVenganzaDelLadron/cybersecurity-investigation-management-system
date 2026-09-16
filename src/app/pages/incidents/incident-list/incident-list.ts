import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../../core/services/incident.service';
import { Incident } from '../../../core/models/incident.model';

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

  constructor(private readonly incidentService: IncidentService) {
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
}
