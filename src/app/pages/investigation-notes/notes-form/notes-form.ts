import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { InvestigationNotePayload } from '../../../core/models/investigation-note.model';
import { InvestigationNoteService } from '../../../core/services/investigation-note.service';

@Component({
  selector: 'app-notes-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './notes-form.css',
  templateUrl: './notes-form.html',
})
export class NotesForm {
  readonly form;
  readonly noteId: number | null;
  loading = false;
  saving = false;
  error = '';
  success = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly noteService: InvestigationNoteService,
  ) {
    this.noteId = Number(this.route.snapshot.paramMap.get('id')) || null;
    this.form = this.fb.group({
      incident_id: [Number(this.route.snapshot.queryParamMap.get('incident_id')) || null, Validators.required],
      note: ['', [Validators.required, Validators.maxLength(5000)]],
      recommendation: ['', Validators.maxLength(5000)],
    });
    if (this.noteId) {
      this.loading = true;
      this.noteService.get(this.noteId).subscribe({
        next: (note) => { this.form.patchValue(note); this.loading = false; },
        error: () => { this.error = 'Unable to load the note.'; this.loading = false; },
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.saving) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.error = '';
    this.success = '';
    const value = this.form.getRawValue();
    const payload: InvestigationNotePayload = {
      incident_id: Number(value.incident_id),
      note: value.note ?? '',
      recommendation: value.recommendation || undefined,
    };
    const request = this.noteId ? this.noteService.update(this.noteId, payload) : this.noteService.create(payload);
    request.subscribe({
      next: () => {
        this.success = this.noteId ? 'Note updated successfully.' : 'Note created successfully.';
        this.saving = false;
        if (!this.noteId) this.form.reset({ incident_id: payload.incident_id, note: '', recommendation: '' });
      },
      error: () => { this.error = 'Unable to save the note.'; this.saving = false; },
    });
  }

  cancel(): void { this.router.navigate(['/notes']); }
}
