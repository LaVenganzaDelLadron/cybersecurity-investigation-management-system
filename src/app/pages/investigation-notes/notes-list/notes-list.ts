import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InvestigationNote } from '../../../core/models/investigation-note.model';
import { InvestigationNoteService } from '../../../core/services/investigation-note.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './notes-list.css',
  templateUrl: './notes-list.html',
})
export class NotesList {
  notes: InvestigationNote[] = [];
  loading = true;
  error = '';
  success = '';
  readonly canManage: boolean;

  constructor(private readonly noteService: InvestigationNoteService, authService: AuthService) {
    this.canManage = authService.hasRole(['admin', 'analyst']);
    this.load();
  }

  load(): void {
    this.loading = true;
    this.noteService.list().subscribe({
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
