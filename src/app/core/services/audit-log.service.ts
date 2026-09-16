import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLogEntry } from '../models/audit-log.model';
import { RequestCacheService } from './request-cache.service';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly baseUrl = `${environment.apiUrl}/audit-logs`;

  constructor(private readonly http: HttpClient, private readonly cache: RequestCacheService) {}

  list(refresh = false): Observable<AuditLogEntry[]> {
    return this.cache.get('auditLogs', () => this.http.get<AuditLogEntry[]>(this.baseUrl), refresh);
  }

}
