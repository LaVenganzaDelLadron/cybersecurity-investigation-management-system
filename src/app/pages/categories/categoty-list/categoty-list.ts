import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Category } from '../../../core/models/category.model';
import { CategoryService } from '../../../core/services/category.service';
import { CategotyForm } from '../categoty-form/categoty-form';
import { SummaryCard, SummaryCards } from '../../../shared/summary-cards/summary-cards';

@Component({
  selector: 'app-categoty-list',
  standalone: true,
  imports: [CommonModule, CategotyForm, SummaryCards],
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
  modalOpen = false;
  editingId: number | null = null;
  @ViewChild('categoryModal') categoryModal?: ElementRef<HTMLElement>;
  private modalTrigger: HTMLElement | null = null;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    this.canManage = this.authService.hasRole('admin');
    this.load();
  }

  get summaryCards(): SummaryCard[] {
    return [
      { icon: 'C', title: 'Categories', description: 'Incident classification groups', value: this.categories.length, target: '#page-content' },
      { icon: 'A', title: 'Active groups', description: 'Available classification options', value: this.categories.length, tone: 'success', target: '#page-content' },
    ];
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

  edit(id: number): void {
    if (this.canManage) {
      this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.editingId = id;
      this.modalOpen = true;
      setTimeout(() => this.categoryModal?.nativeElement.focus());
    }
  }
  create(): void {
    if (this.canManage) {
      this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.editingId = null;
      this.modalOpen = true;
      setTimeout(() => this.categoryModal?.nativeElement.focus());
    }
  }

  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.modalTrigger?.focus();
    this.modalTrigger = null;
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void { this.closeModal(); }

  @HostListener('document:keydown', ['$event'])
  trapModalFocus(event: KeyboardEvent): void {
    if (!this.modalOpen || event.key !== 'Tab' || !this.categoryModal) return;
    const focusable = Array.from(this.categoryModal.nativeElement.querySelectorAll<HTMLElement>(
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

  refreshAfterSave(): void {
    this.closeModal();
    this.load();
  }

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
