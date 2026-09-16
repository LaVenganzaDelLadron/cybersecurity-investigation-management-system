import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { AuditLogEntry } from '../../core/models/audit-log.model';
import { AuditLogService } from '../../core/services/audit-log.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './audit-logs.css',
  templateUrl: './audit-logs.html',
})
export class AuditLogs {
  audits: AuditLogEntry[] = [];
  loading = true;
  error = '';
  filter = '';

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

  get filteredAudits(): AuditLogEntry[] {
    const query = this.filter.trim().toLowerCase();
    if (!query) return this.audits;
    return this.audits.filter((log) =>
      [log.action, log.resource_type, log.details, String(log.actor_id ?? ''), String(log.resource_id ?? '')]
        .some((value) => value?.toLowerCase().includes(query)),
    );
  }

  formatDetails(details?: string): string {
    if (!details) return '—';
    try {
      const parsed = JSON.parse(details);
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    } catch {
      return details;
    }
  }
}
