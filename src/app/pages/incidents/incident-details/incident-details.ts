import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EditIncident } from '../edit-incident/edit-incident';
import { ActivatedRoute } from '@angular/router';
import { Incident } from '../../../core/models/incident.model';
import { IncidentService } from '../../../core/services/incident.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [CommonModule, RouterLink, EditIncident],
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
  editOpen = false;
  @ViewChild('editModal') editModal?: ElementRef<HTMLElement>;
  private readonly route: ActivatedRoute;
  private modalTrigger: HTMLElement | null = null;

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

    this.loadIncident(id);
  }

  loadIncident(id: number): void {
    this.loading = true;
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

  refreshIncident(): void {
    if (this.incident) this.loadIncident(this.incident.id);
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

  openEdit(): void {
    if (!this.incident || !this.canEdit) return;
    this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.editOpen = true;
    setTimeout(() => this.editModal?.nativeElement.focus());
  }

  closeEdit(): void {
    this.editOpen = false;
    this.modalTrigger?.focus();
    this.modalTrigger = null;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.editOpen) this.closeEdit();
  }

  @HostListener('document:keydown', ['$event'])
  trapEditFocus(event: KeyboardEvent): void {
    if (!this.editOpen || event.key !== 'Tab' || !this.editModal) return;
    const elements = Array.from(this.editModal.nativeElement.querySelectorAll<HTMLElement>(
      'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    ));
    if (!elements.length) return;
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
