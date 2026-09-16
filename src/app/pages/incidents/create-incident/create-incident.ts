import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IncidentPayload } from '../../../core/models/incident.model';
import { IncidentService } from '../../../core/services/incident.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-create-incident',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './create-incident.css',
  templateUrl: './create-incident.html',
})
export class CreateIncident {
  @Input() modal = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  form;

  loading = false;
  error = '';
  categories: Category[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly incidentService: IncidentService,
    private readonly categoryService: CategoryService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category_id: [null],
      severity: ['medium', Validators.required],
      status: ['new', Validators.required],
      location: ['', Validators.required],
      incident_date: ['', Validators.required],
      resolve_at: [null],
    });
    this.categoryService.list().subscribe({
      next: (categories) => (this.categories = categories),
      error: () => (this.error = 'Unable to load categories.'),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const values = this.form.getRawValue();
    const payload: IncidentPayload = {
      ...values,
      category_id: values.category_id ?? undefined,
      title: values.title ?? '',
      description: values.description ?? '',
      severity: values.severity ?? 'medium',
      status: values.status ?? 'new',
      location: values.location ?? '',
      incident_date: values.incident_date ?? '',
    };

    this.incidentService.create(payload).subscribe({
      next: () => this.modal ? this.saved.emit() : this.router.navigateByUrl('/incidents'),
      error: () => {
        this.error = 'Unable to create the incident.';
        this.loading = false;
      },
    });
  }

  cancel(): void {
    if (this.modal) this.cancelled.emit();
    else void this.router.navigateByUrl('/incidents');
  }
}
