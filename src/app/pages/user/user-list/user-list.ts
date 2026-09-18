import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UserSummary } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserForm } from '../user-form/user-form';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, UserForm],
  styleUrl: './user-list.css',
  templateUrl: './user-list.html',
})
export class UserList {
  users: UserSummary[] = [];
  loading = true;
  error = '';
  actionError = '';
  deleting = false;
  canManage = false;
  modalOpen = false;
  editingId: number | null = null;
  @ViewChild('userModal') userModal?: ElementRef<HTMLElement>;
  private modalTrigger: HTMLElement | null = null;

  constructor(
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    this.canManage = this.authService.hasRole('admin');
    this.load();
  }

  load(refresh = false): void {
    this.loading = true;
    this.error = '';
    this.userService.list(refresh).subscribe({
      next: (users) => (this.users = users),
      error: () => {
        this.error = 'Unable to load users.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }

  create(): void { this.openModal(null); }
  edit(id: number): void { this.openModal(id); }

  openModal(id: number | null): void {
    if (!this.canManage) return;
    this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.editingId = id;
    this.modalOpen = true;
    setTimeout(() => this.userModal?.nativeElement.focus());
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
  trapFocus(event: KeyboardEvent): void {
    if (!this.modalOpen || event.key !== 'Tab' || !this.userModal) return;
    const elements = Array.from(this.userModal.nativeElement.querySelectorAll<HTMLElement>('button,a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])'));
    if (!elements.length) return;
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  remove(user: UserSummary): void {
    if (!this.canManage || this.deleting || !window.confirm(`Delete ${user.email}?`)) return;
    this.deleting = true;
    this.actionError = '';
    this.userService.delete(user.id).subscribe({
      next: () => (this.users = this.users.filter((item) => item.id !== user.id)),
      error: () => { this.actionError = 'Unable to delete the user.'; this.deleting = false; },
      complete: () => (this.deleting = false),
    });
  }
}
