import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Incident } from '../../../core/models/incident.model';
import { IncidentService } from '../../../core/services/incident.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './incident-details.css',
  templateUrl: './incident-details.html',
})
export class IncidentDetails {
  incident: Incident | null = null;
  loading = true;
  error = '';
  readonly isAdmin: boolean;
  readonly canEdit: boolean;
  readonly canInvestigate: boolean;

  constructor(
    route: ActivatedRoute,
    private readonly incidentService: IncidentService,
    authService: AuthService,
    private readonly router: Router,
  ) {
    this.isAdmin = authService.hasRole('admin');
    this.canEdit = authService.hasRole(['admin', 'analyst']);
    this.canInvestigate = authService.hasRole(['admin', 'analyst']);
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

  deleteIncident(): void {
    if (!this.incident || !this.isAdmin || !confirm(`Delete "${this.incident.title}"?`)) {
      return;
    }
    this.incidentService.delete(this.incident.id).subscribe({
      next: () => void this.router.navigateByUrl('/incidents'),
      error: () => (this.error = 'Unable to delete the incident.'),
    });
  }
}
