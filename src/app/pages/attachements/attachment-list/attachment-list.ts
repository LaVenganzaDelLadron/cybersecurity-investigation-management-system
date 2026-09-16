import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Attachment } from '../../../core/models/attachment.model';
import { AttachmentService } from '../../../core/services/attachment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styleUrl: './attachment-list.css',
  templateUrl: './attachment-list.html',
})
export class AttachmentList {
  attachments: Attachment[] = [];
  loading = true;
  error = '';
  success = '';
  editing: Attachment | null = null;
  formOpen = false;
  readonly canManage: boolean;
  readonly form;

  constructor(private readonly attachmentService: AttachmentService, private readonly fb: FormBuilder, authService: AuthService) {
    this.canManage = authService.hasRole(['admin', 'analyst']);
    this.form = this.fb.group({
      incident_id: [null as number | null],
      filename: ['', Validators.required],
      filepath: [''],
      filetype: [''],
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.attachmentService.list().subscribe({
      next: (attachments) => (this.attachments = attachments),
      error: () => { this.error = 'Unable to load attachments.'; this.loading = false; },
      complete: () => (this.loading = false),
    });
  }

  startCreate(): void {
    this.editing = null;
    this.formOpen = true;
    this.form.reset();
    this.error = '';
  }

  startEdit(attachment: Attachment): void {
    this.editing = attachment;
    this.formOpen = true;
    this.form.patchValue({
      incident_id: attachment.incident_id ?? null,
      filename: attachment.filename,
      filepath: attachment.filepath ?? '',
      filetype: attachment.filetype ?? '',
    });
    this.error = '';
  }

  cancelEdit(): void { this.editing = null; this.formOpen = false; this.form.reset(); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.error = '';
    this.success = '';
    const value = this.form.getRawValue();
    const payload = {
      incident_id: value.incident_id ? Number(value.incident_id) : undefined,
      filename: value.filename ?? '',
      filepath: value.filepath || undefined,
      filetype: value.filetype || undefined,
    };
    const request = this.editing ? this.attachmentService.update(this.editing.id, payload) : this.attachmentService.create(payload);
    request.subscribe({
      next: (attachment) => {
        this.attachments = this.editing ? this.attachments.map((item) => item.id === attachment.id ? attachment : item) : [attachment, ...this.attachments];
        this.success = this.editing ? 'Attachment updated successfully.' : 'Attachment created successfully.';
        this.cancelEdit();
      },
      error: () => (this.error = 'Unable to save the attachment.'),
    });
  }

  deleteAttachment(attachment: Attachment): void {
    if (!this.canManage || !confirm(`Delete "${attachment.filename}"?`)) return;
    this.attachmentService.delete(attachment.id).subscribe({
      next: () => { this.attachments = this.attachments.filter((item) => item.id !== attachment.id); this.success = 'Attachment deleted successfully.'; },
      error: () => (this.error = 'Unable to delete the attachment.'),
    });
  }
}
