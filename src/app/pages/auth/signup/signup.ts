import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth.service';
import type { SignupRequest } from '../../../types';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {
  form;

  loading = false;
  error = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: SignupRequest = {
      firstname: this.form.get('firstname')?.value ?? '',
      lastname: this.form.get('lastname')?.value ?? '',
      email: this.form.get('email')?.value ?? '',
      password: this.form.get('password')?.value ?? '',
    };

    this.loading = true;
    this.error = '';

    this.authService.signup(payload).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.detail || 'Unable to create your account.';
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
