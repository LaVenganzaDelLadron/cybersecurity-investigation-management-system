import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentPayload } from '../../../core/models/incident.model';
import { IncidentService } from '../../../core/services/incident.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { UserSummary } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-edit-incident',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './edit-incident.css',
  templateUrl: './edit-incident.html',
})
export class EditIncident implements OnInit {
  @Input() modal = false;
  @Input() incidentIdInput: number | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  form;
  loading = true;
  saving = false;
  error = '';
  private incidentId = 0;
  categories: Category[] = [];
  analysts: UserSummary[] = [];
  readonly isAdmin: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly incidentService: IncidentService,
    private readonly categoryService: CategoryService,
    private readonly userService: UserService,
    authService: AuthService,
  ) {
    this.isAdmin = authService.hasRole('admin');
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category_id: [null],
      severity: ['high', Validators.required],
      status: ['investigating', Validators.required],
      location: ['', Validators.required],
      incident_date: ['', Validators.required],
      resolve_at: [null],
      assigned_to: [null],
    });
    if (this.isAdmin) {
      this.userService.list().subscribe({
        next: (users) => (this.analysts = users.filter((user) => user.role === 'analyst' && user.status === 'active')),
        error: () => (this.error = 'Unable to load analysts.'),
      });
    }
    this.categoryService.list().subscribe({
      next: (categories) => (this.categories = categories),
      error: () => (this.error = 'Unable to load categories.'),
    });
  }

  ngOnInit(): void {
    this.incidentId = this.incidentIdInput ?? Number(this.route.snapshot.paramMap.get('id'));
    this.loadIncident();
  }

  private loadIncident(): void {
    this.incidentService.get(this.incidentId).subscribe({
      next: (incident) => {
        this.form.patchValue({
          title: incident.title,
          description: incident.description ?? '',
          category_id: incident.category_id ?? null,
          severity: incident.severity,
          status: incident.status,
          location: incident.location ?? '',
          incident_date: incident.incident_date ?? '',
          resolve_at: incident.resolve_at ?? null,
          assigned_to: incident.assigned_to ?? null,
        } as never);
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load the incident.';
        this.loading = false;
      },
    });
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    const values = this.form.getRawValue();
    const payload: Partial<IncidentPayload> = {
      title: values.title ?? '',
      description: values.description ?? '',
      category_id: values.category_id ?? undefined,
      severity: values.severity ?? 'medium',
      status: values.status ?? 'new',
      location: values.location ?? '',
      incident_date: values.incident_date ?? '',
      resolve_at: values.resolve_at ?? null,
      ...(this.isAdmin ? { assigned_to: values.assigned_to ?? null } : {}),
    };

    this.incidentService.update(this.incidentId, payload).subscribe({
      next: () => this.modal ? this.saved.emit() : this.router.navigate(['/incidents', this.incidentId]),
      error: () => {
        this.error = 'Unable to update the incident.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    if (this.modal) this.cancelled.emit();
    else void this.router.navigate(['/incidents', this.incidentId]);
  }
}
