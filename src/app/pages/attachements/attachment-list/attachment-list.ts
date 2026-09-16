import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Attachment } from '../../../core/models/attachment.model';
import { AttachmentService } from '../../../core/services/attachment.service';

@Component({
  selector: 'app-attachment-list',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './attachment-list.css',
  templateUrl: './attachment-list.html',
})
export class AttachmentList {
  attachments: Attachment[] = [];
  loading = true;
  error = '';

  constructor(private readonly attachmentService: AttachmentService) {
    this.attachmentService.list().subscribe({
      next: (attachments) => (this.attachments = attachments),
      error: () => {
        this.error = 'Unable to load attachments.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
