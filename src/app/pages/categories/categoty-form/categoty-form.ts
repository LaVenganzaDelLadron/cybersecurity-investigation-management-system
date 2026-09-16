import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryPayload } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-categoty-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './categoty-form.css',
  templateUrl: './categoty-form.html',
})
export class CategotyForm implements OnInit {
  readonly form;
  id: number | null;
  loading = false;
  loadingRecord = false;
  error = '';
  success = '';
  @Input() categoryId: number | null = null;
  @Input() modal = false;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly categoryService: CategoryService,
    private readonly route: ActivatedRoute,
    public readonly router: Router,
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    this.id = id ? Number(id) : null;
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
    });
  }

  ngOnInit(): void {
    if (this.modal) {
      this.id = this.categoryId;
    }
    if (this.id !== null) {
      this.loadingRecord = true;
      this.categoryService.get(this.id).subscribe({
        next: (category) => this.form.patchValue(category),
        error: () => (this.error = 'Unable to load the category.'),
        complete: () => (this.loadingRecord = false),
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';
    const value = this.form.getRawValue();
    const payload: CategoryPayload = {
      name: value.name ?? '',
      description: value.description || undefined,
    };
    const request = this.id === null
      ? this.categoryService.create(payload)
      : this.categoryService.update(this.id, payload);
    request.subscribe({
      next: () => {
        this.success = this.id === null ? 'Category created.' : 'Category updated.';
        this.loading = false;
        if (this.modal) {
          this.saved.emit();
        } else {
          setTimeout(() => this.router.navigateByUrl('/categories'), 500);
        }
      },
      error: () => {
        this.error = 'Unable to save the category.';
        this.loading = false;
      },
    });
  }

  cancel(): void {
    if (this.modal) {
      this.cancelled.emit();
    } else {
      void this.router.navigateByUrl('/categories');
    }
  }
}
