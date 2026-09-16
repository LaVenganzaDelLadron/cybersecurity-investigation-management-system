import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './user-form.css',
  templateUrl: './user-form.html',
})
export class UserForm implements OnInit {
  @Input() modal = false;
  @Input() userId: number | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  readonly form;
  id: number | null;
  loading = false;
  loadingRecord = false;
  error = '';
  success = '';
  readonly roles: UserRole[] = ['admin', 'analyst', 'user'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly route: ActivatedRoute,
    public readonly router: Router,
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    this.id = id ? Number(id) : null;
    this.form = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['user' as UserRole, Validators.required],
      status: ['active', Validators.required],
      password: [''],
    });
  }

  ngOnInit(): void {
    if (this.modal) this.id = this.userId;
    const passwordControl = this.form.controls.password;
    passwordControl.setValidators(this.id === null ? Validators.required : []);
    passwordControl.updateValueAndValidity();
    if (this.id !== null) {
      this.loadingRecord = true;
      this.userService.get(this.id).subscribe({
        next: (user) => this.form.patchValue(user),
        error: () => (this.error = 'Unable to load the user.'),
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
    const payload = {
      firstname: value.firstname ?? '',
      lastname: value.lastname ?? '',
      email: value.email ?? '',
      role: value.role as UserRole,
      status: value.status ?? 'active',
      ...(value.password ? { password: value.password } : {}),
    };
    const request = this.id === null
      ? this.userService.create(payload)
      : this.userService.update(this.id, payload);
    request.subscribe({
      next: () => {
        this.success = this.id === null ? 'User created.' : 'User updated.';
        this.loading = false;
        if (this.modal) this.saved.emit();
        else setTimeout(() => this.router.navigateByUrl('/users'), 500);
      },
      error: () => { this.error = 'Unable to save the user.'; this.loading = false; },
    });
  }

  cancel(): void {
    if (this.modal) this.cancelled.emit();
    else void this.router.navigateByUrl('/users');
  }
}
