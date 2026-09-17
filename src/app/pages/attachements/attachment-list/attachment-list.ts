import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Attachment } from '../../../core/models/attachment.model';
import { AttachmentService } from '../../../core/services/attachment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { SummaryCard, SummaryCards } from '../../../shared/summary-cards/summary-cards';

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SummaryCards],
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
  readonly canDelete: boolean;
  readonly form;
  @ViewChild('attachmentModal') attachmentModal?: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  private modalTrigger: HTMLElement | null = null;
  selectedFile: File | null = null;

  constructor(
    private readonly attachmentService: AttachmentService,
    private readonly fb: FormBuilder,
    authService: AuthService,
    route: ActivatedRoute,
  ) {
    this.canManage = authService.hasRole(['admin', 'analyst']);
    this.canDelete = authService.hasRole('admin');
    this.form = this.fb.group({
      incident_id: [null as number | null],
      filename: ['', Validators.required],
      filepath: [''],
      filetype: [''],
    });
    const incidentId = Number(route.snapshot.queryParamMap.get('incident_id')) || undefined;
    this.load(incidentId);
  }

  get summaryCards(): SummaryCard[] {
    return [
      { icon: 'A', title: 'Attachments', description: 'Evidence metadata records', value: this.attachments.length, target: '#page-content' },
      { icon: 'E', title: 'Evidence files', description: 'Files linked to incidents', value: this.attachments.filter((item) => !!item.incident_id).length, tone: 'success', target: '#page-content' },
    ];
  }

  load(incidentId?: number): void {
    this.loading = true;
    this.attachmentService.list(incidentId).subscribe({
      next: (attachments) => (this.attachments = attachments),
      error: () => { this.error = 'Unable to load attachments.'; this.loading = false; },
      complete: () => (this.loading = false),
    });
  }

  startCreate(): void {
    this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.editing = null;
    this.formOpen = true;
    this.form.reset();
    this.selectedFile = null;
    this.error = '';
    setTimeout(() => this.attachmentModal?.nativeElement.focus());
  }

  startEdit(attachment: Attachment): void {
    this.modalTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.editing = attachment;
    this.formOpen = true;
    this.form.patchValue({
      incident_id: attachment.incident_id ?? null,
      filename: attachment.filename,
      filepath: attachment.filepath ?? '',
      filetype: attachment.filetype ?? '',
    });
    this.selectedFile = null;
    this.error = '';
    setTimeout(() => this.attachmentModal?.nativeElement.focus());
  }

  cancelEdit(): void {
    this.editing = null;
    this.formOpen = false;
    this.form.reset();
    this.selectedFile = null;
    this.modalTrigger?.focus();
    this.modalTrigger = null;
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    if (this.selectedFile) {
      this.form.patchValue({
        filename: this.selectedFile.name,
        filetype: this.selectedFile.type || undefined,
      });
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void { if (this.formOpen) this.cancelEdit(); }

  @HostListener('document:keydown', ['$event'])
  trapFocus(event: KeyboardEvent): void {
    if (!this.formOpen || event.key !== 'Tab' || !this.attachmentModal) return;
    const elements = Array.from(this.attachmentModal.nativeElement.querySelectorAll<HTMLElement>('button,a[href],input,textarea,select,[tabindex]:not([tabindex="-1"])'));
    if (!elements.length) return;
    const first = elements[0], last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.editing && !this.selectedFile) {
      this.error = 'Select a file to upload.';
      return;
    }
    this.error = '';
    this.success = '';
    const value = this.form.getRawValue();
    const payload = {
      incident_id: value.incident_id ? Number(value.incident_id) : undefined,
      filename: value.filename ?? '',
      filetype: value.filetype || undefined,
    };
    const request = this.editing
      ? this.attachmentService.update(this.editing.id, payload)
      : this.attachmentService.create(this.selectedFile!, payload.incident_id);
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
