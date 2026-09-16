import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { Incident } from '../../core/models/incident.model';
import { Category } from '../../core/models/category.model';
import { InvestigationNote } from '../../core/models/investigation-note.model';
import { Attachment } from '../../core/models/attachment.model';
import { ChatMessage } from '../../core/models/chat.model';
import { UserSummary } from '../../core/models/user.model';
import { AuditLogEntry } from '../../core/models/audit-log.model';
import { IncidentService } from '../../core/services/incident.service';
import { CategoryService } from '../../core/services/category.service';
import { InvestigationNoteService } from '../../core/services/investigation-note.service';
import { AttachmentService } from '../../core/services/attachment.service';
import { ChatService } from '../../core/services/chat.service';
import { UserService } from '../../core/services/user.service';
import { AuditLogService } from '../../core/services/audit-log.service';

export type DashboardResource =
  | 'incidents'
  | 'categories'
  | 'notes'
  | 'attachments'
  | 'chats'
  | 'users'
  | 'auditLogs';

interface DashboardCard {
  key: DashboardResource;
  label: string;
  description: string;
  count: number;
  tone: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  role = 'user';
  incidents: Incident[] = [];
  categories: Category[] = [];
  notes: InvestigationNote[] = [];
  attachments: Attachment[] = [];
  chats: ChatMessage[] = [];
  users: UserSummary[] = [];
  auditLogs: AuditLogEntry[] = [];
  loading = true;
  error = '';
  resourceErrors: Partial<Record<DashboardResource, boolean>> = {};
  selectedResource: DashboardResource | null = null;
  @ViewChild('resourceModal') resourceModal?: ElementRef<HTMLElement>;
  private modalTrigger: HTMLElement | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly incidentService: IncidentService,
    private readonly categoryService: CategoryService,
    private readonly noteService: InvestigationNoteService,
    private readonly attachmentService: AttachmentService,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly auditLogService: AuditLogService,
  ) {
    this.role = this.authService.getCurrentUser()?.role ?? 'user';
    this.loadDashboard();
  }

  get cards(): DashboardCard[] {
    const cards: DashboardCard[] = [
      { key: 'incidents', label: 'Incidents', description: 'Cases visible to your role', count: this.incidents.length, tone: 'blue', route: '/incidents' },
      { key: 'categories', label: 'Categories', description: 'Incident classification groups', count: this.categories.length, tone: 'violet', route: '/categories' },
      { key: 'attachments', label: 'Attachments', description: 'Evidence metadata records', count: this.attachments.length, tone: 'cyan', route: '/attachments' },
      { key: 'chats', label: 'AI conversations', description: 'Assistant conversations', count: this.chats.length, tone: 'green', route: '/chat' },
    ];
    if (this.role === 'admin' || this.role === 'analyst') {
      cards.splice(2, 0, { key: 'notes', label: 'Investigation notes', description: 'Analyst findings and recommendations', count: this.notes.length, tone: 'amber', route: '/notes' });
    }
    if (this.role === 'admin') {
      cards.push(
        { key: 'users', label: 'Users', description: 'Accounts managed by administrators', count: this.users.length, tone: 'pink', route: '/users' },
        { key: 'auditLogs', label: 'Audit events', description: 'Recent system activity', count: this.auditLogs.length, tone: 'slate', route: '/audit-logs' },
      );
    }
    return cards;
  }

  get stats() {
    return [
      { label: 'Open incidents', value: this.incidents.filter((incident) => !['resolved', 'closed'].includes(this.normalise(incident.status))), tone: 'accent' },
      { label: 'Investigating', value: this.countByStatus('investigating'), tone: 'warning' },
      { label: 'Resolved', value: this.countByStatus('resolved'), tone: 'success' },
      { label: 'Critical alerts', value: this.incidents.filter((incident) => this.normalise(incident.severity) === 'critical'), tone: 'danger' },
    ];
  }

  get recentIncidents(): Incident[] {
    return [...this.incidents]
      .sort((a, b) => this.dateValue(b.updated_at ?? b.created_at) - this.dateValue(a.updated_at ?? a.created_at))
      .slice(0, 5);
  }

  get selectedCard(): DashboardCard | undefined {
    return this.cards.find((card) => card.key === this.selectedResource);
  }

  loadDashboard(refresh = false): void {
    this.loading = true;
    this.error = '';
    this.resourceErrors = {};
    const admin = this.role === 'admin';
    const investigator = admin || this.role === 'analyst';
    forkJoin({
      incidents: this.resource(this.incidentService.list(refresh), 'incidents'),
      categories: this.resource(this.categoryService.list(refresh), 'categories'),
      attachments: this.resource(this.attachmentService.list(undefined, refresh), 'attachments'),
      chats: this.resource(this.chatService.list(refresh), 'chats'),
      ...(investigator ? { notes: this.resource(this.noteService.list(undefined, refresh), 'notes') } : {}),
      ...(admin ? {
        users: this.resource(this.userService.list(refresh), 'users'),
        auditLogs: this.resource(this.auditLogService.list(refresh), 'auditLogs'),
      } : {}),
    }).pipe(
      finalize(() => (this.loading = false)),
    ).subscribe({
      next: (data) => {
        this.incidents = data.incidents;
        this.categories = data.categories;
        this.attachments = data.attachments;
        this.chats = data.chats;
        if (investigator) this.notes = data.notes ?? [];
        if (admin) {
          this.users = data.users ?? [];
          this.auditLogs = data.auditLogs ?? [];
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load dashboard data. Please try again.';
      },
      complete: () => undefined,
    });
  }

  openResource(resource: DashboardResource): void {
    this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.selectedResource = resource;
    setTimeout(() => this.resourceModal?.nativeElement.focus());
  }

  closeResource(): void {
    this.selectedResource = null;
    this.modalTrigger?.focus();
    this.modalTrigger = null;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeResource();
  }

  @HostListener('document:keydown', ['$event'])
  trapModalFocus(event: KeyboardEvent): void {
    if (!this.selectedResource || event.key !== 'Tab' || !this.resourceModal) return;
    const focusable = Array.from(this.resourceModal.nativeElement.querySelectorAll<HTMLElement>(
      'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    ));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  resourceHasError(resource: DashboardResource): boolean {
    return !!this.resourceErrors[resource];
  }

  private resource<T>(request: import('rxjs').Observable<T[]>, resource: DashboardResource) {
    return request.pipe(
      catchError(() => {
        this.resourceErrors[resource] = true;
        return of([] as T[]);
      }),
    );
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
