import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

  constructor(private readonly categoryService: CategoryService) {
    this.categoryService.list().subscribe({
      next: (categories) => (this.categories = categories),
      error: () => {
        this.error = 'Unable to load categories.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
