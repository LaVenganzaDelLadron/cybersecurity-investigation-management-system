import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-categoty-list',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './categoty-list.css',
  templateUrl: './categoty-list.html',
})
export class CategotyList {
  categories: Category[] = [];
  loading = true;
  error = '';
  actionError = '';
  deleting = false;
  canManage = false;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    this.canManage = this.authService.hasRole('admin');
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.categoryService.list().subscribe({
      next: (categories) => (this.categories = categories),
      error: () => {
        this.error = 'Unable to load categories.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  edit(id: number): void { this.router.navigate(['/categories', id, 'edit']); }
  create(): void { this.router.navigateByUrl('/categories/new'); }

  remove(category: Category): void {
    if (!this.canManage || this.deleting || !window.confirm(`Delete "${category.name}"?`)) return;
    this.deleting = true;
    this.actionError = '';
    this.categoryService.delete(category.id).subscribe({
      next: () => (this.categories = this.categories.filter((item) => item.id !== category.id)),
      error: () => { this.actionError = 'Unable to delete the category.'; this.deleting = false; },
      complete: () => (this.deleting = false),
    });
  }
}
