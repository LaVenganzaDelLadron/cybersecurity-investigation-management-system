import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InvestigationNote } from '../../../core/models/investigation-note.model';
import { InvestigationNoteService } from '../../../core/services/investigation-note.service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './notes-list.css',
  templateUrl: './notes-list.html',
})
export class NotesList {
  notes: InvestigationNote[] = [];
  loading = true;
  error = '';

  constructor(private readonly noteService: InvestigationNoteService) {
    this.noteService.list().subscribe({
      next: (notes) => (this.notes = notes),
      error: () => {
        this.error = 'Unable to load investigation notes.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
