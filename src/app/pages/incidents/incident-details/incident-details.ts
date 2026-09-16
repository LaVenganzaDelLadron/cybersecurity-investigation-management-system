import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Incident } from '../../../core/models/incident.model';
import { IncidentService } from '../../../core/services/incident.service';

@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './incident-details.css',
  templateUrl: './incident-details.html',
})
export class IncidentDetails {
  incident: Incident | null = null;
  loading = true;
  error = '';

  constructor(
    route: ActivatedRoute,
    incidentService: IncidentService,
  ) {
    const id = Number(route.snapshot.paramMap.get('id'));
    incidentService.get(id).subscribe({
      next: (incident) => {
        this.incident = incident;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load the incident.';
        this.loading = false;
      },
    });
  }
}
