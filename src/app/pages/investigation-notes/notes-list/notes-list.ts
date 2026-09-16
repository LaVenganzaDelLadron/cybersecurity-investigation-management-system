import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { InvestigationNote } from '../../../core/models/investigation-note.model';
import { InvestigationNoteService } from '../../../core/services/investigation-note.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { NotesForm } from '../notes-form/notes-form';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, NotesForm],
  styleUrl: './notes-list.css',
  templateUrl: './notes-list.html',
})
export class NotesList {
  notes: InvestigationNote[] = [];
  loading = true;
  error = '';
  success = '';
  readonly canManage: boolean;
  readonly canDelete: boolean;
  modalOpen = false;
  editingId: number | null = null;
  @ViewChild('noteModal') noteModal?: ElementRef<HTMLElement>;
  private modalTrigger: HTMLElement | null = null;

  constructor(
    private readonly noteService: InvestigationNoteService,
    authService: AuthService,
    route: ActivatedRoute,
  ) {
    this.canManage = authService.hasRole(['admin', 'analyst']);
    this.canDelete = authService.hasRole('admin');
    const incidentId = Number(route.snapshot.queryParamMap.get('incident_id')) || undefined;
    this.load(incidentId);
  }

  openModal(id: number | null): void {
    if (!this.canManage) return;
    this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.editingId = id;
    this.modalOpen = true;
    setTimeout(() => this.noteModal?.nativeElement.focus());
  }

  closeModal(): void { this.modalOpen = false; this.editingId = null; this.modalTrigger?.focus(); this.modalTrigger = null; }

  @HostListener('document:keydown.escape')
  handleEscape(): void { this.closeModal(); }

  @HostListener('document:keydown', ['$event'])
  trapFocus(event: KeyboardEvent): void {
    if (!this.modalOpen || event.key !== 'Tab' || !this.noteModal) return;
    const elements = Array.from(this.noteModal.nativeElement.querySelectorAll<HTMLElement>('button,a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])'));
    if (!elements.length) return;
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  load(incidentId?: number): void {
    this.loading = true;
    this.noteService.list(incidentId).subscribe({
      next: (notes) => (this.notes = notes),
      error: () => { this.error = 'Unable to load investigation notes.'; this.loading = false; },
      complete: () => (this.loading = false),
    });
  }

  deleteNote(note: InvestigationNote): void {
    if (!this.canManage || !confirm('Delete this investigation note?')) return;
    this.noteService.delete(note.id).subscribe({
      next: () => { this.notes = this.notes.filter((item) => item.id !== note.id); this.success = 'Note deleted successfully.'; },
      error: () => (this.error = 'Unable to delete the note.'),
    });
  }
}
