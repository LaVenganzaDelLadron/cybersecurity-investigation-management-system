import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Incident } from '../../../core/models/incident.model';
import { IncidentService } from '../../../core/services/incident.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './incident-details.css',
  templateUrl: './incident-details.html',
})
export class IncidentDetails implements OnInit {
  incident: Incident | null = null;
  loading = true;
  error = '';
  readonly isAdmin: boolean;
  readonly canEdit: boolean;
  readonly canInvestigate: boolean;
  private readonly route: ActivatedRoute;

  constructor(
    route: ActivatedRoute,
    private readonly incidentService: IncidentService,
    authService: AuthService,
    private readonly router: Router,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {
    this.route = route;
    this.isAdmin = authService.hasRole('admin');
    this.canEdit = authService.hasRole(['admin', 'analyst']);
    this.canInvestigate = authService.hasRole(['admin', 'analyst']);
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.error = 'The incident ID is invalid.';
      this.loading = false;
      return;
    }

    this.incidentService.get(id).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe({
      next: (incident) => {
        this.incident = incident;
      },
      error: (error) => {
        this.error = error?.name === 'TimeoutError'
          ? 'The incident request timed out. Please try again.'
          : 'Unable to load the incident.';
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
