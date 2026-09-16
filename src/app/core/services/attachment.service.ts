import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attachment, AttachmentPayload } from '../models/attachment.model';
import { RequestCacheService } from './request-cache.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly baseUrl = `${environment.apiUrl}/attachments`;

  constructor(private readonly http: HttpClient, private readonly cache: RequestCacheService) {}

  list(incidentId?: number, refresh = false): Observable<Attachment[]> {
    const url = incidentId ? `${this.baseUrl}?incident_id=${incidentId}` : this.baseUrl;
    return this.cache.get(`attachments:${incidentId ?? 'all'}`, () => this.http.get<Attachment[]>(url), refresh);
  }

  get(id: number): Observable<Attachment> {
    return this.http.get<Attachment>(`${this.baseUrl}/${id}`);
  }

  create(payload: AttachmentPayload): Observable<Attachment> {
    return this.http.post<Attachment>(this.baseUrl, payload).pipe(tap(() => this.cache.invalidate('attachments')));
  }

  update(id: number, payload: Partial<AttachmentPayload>): Observable<Attachment> {
    return this.http.put<Attachment>(`${this.baseUrl}/${id}`, payload).pipe(tap(() => this.cache.invalidate('attachments')));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(tap(() => this.cache.invalidate('attachments')));
  }
}
