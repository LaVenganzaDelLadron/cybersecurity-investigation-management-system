import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CreateIncident } from '../create-incident/create-incident';
import { EditIncident } from '../edit-incident/edit-incident';
import { IncidentService } from '../../../core/services/incident.service';
import { Incident } from '../../../core/models/incident.model';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CreateIncident, EditIncident],
  styleUrl: './incident-list.css',
  templateUrl: './incident-list.html',
})
export class IncidentList {
  incidents: Incident[] = [];
  loading = true;
  error = '';
  readonly isAdmin: boolean;
  readonly canEdit: boolean;
  modal: 'create' | 'edit' | null = null;
  editingId: number | null = null;
  @ViewChild('incidentModal') incidentModal?: ElementRef<HTMLElement>;
  private modalTrigger: HTMLElement | null = null;

  constructor(
    private readonly incidentService: IncidentService,
    authService: AuthService,
  ) {
    this.isAdmin = authService.hasRole('admin');
    this.canEdit = authService.hasRole(['admin', 'analyst']);
    this.loadIncidents();
  }

  openCreate(event?: Event): void {
    event?.preventDefault();
    this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.modal = 'create';
    setTimeout(() => this.incidentModal?.nativeElement.focus());
  }

  openEdit(id: number, event?: Event): void {
    event?.preventDefault();
    this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.editingId = id;
    this.modal = 'edit';
    setTimeout(() => this.incidentModal?.nativeElement.focus());
  }

  closeModal(): void {
    this.modal = null;
    this.editingId = null;
    this.modalTrigger?.focus();
    this.modalTrigger = null;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void { this.closeModal(); }

  @HostListener('document:keydown', ['$event'])
  trapFocus(event: KeyboardEvent): void {
    if (!this.modal || event.key !== 'Tab' || !this.incidentModal) return;
    const elements = Array.from(this.incidentModal.nativeElement.querySelectorAll<HTMLElement>('button,a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])'));
    if (!elements.length) return;
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  loadIncidents(): void {
    this.loading = true;
    this.incidentService.list().pipe(
      finalize(() => (this.loading = false)),
    ).subscribe({
      next: (incidents) => (this.incidents = incidents),
      error: () => {
        this.error = 'Unable to load incidents.';
      },
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
