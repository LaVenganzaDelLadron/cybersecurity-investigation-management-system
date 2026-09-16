import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuditLogEntry } from '../../core/models/audit-log.model';
import { AuditLogService } from '../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './audit-logs.css',
  templateUrl: './audit-logs.html',
})
export class AuditLogs {
  audits: AuditLogEntry[] = [];
  loading = true;
  error = '';

  constructor(private readonly auditLogService: AuditLogService) {
    this.auditLogService.list().subscribe({
      next: (audits) => (this.audits = audits),
      error: () => {
        this.error = 'Unable to load audit logs.';
        this.loading = false;
      },
      complete: () => (this.loading = false),
    });
  }
}
