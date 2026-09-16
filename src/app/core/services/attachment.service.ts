import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attachment, AttachmentPayload } from '../models/attachment.model';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private readonly baseUrl = `${environment.apiUrl}/attachments`;

  constructor(private readonly http: HttpClient) {}

  list(incidentId?: number): Observable<Attachment[]> {
    const url = incidentId ? `${this.baseUrl}?incident_id=${incidentId}` : this.baseUrl;
    return this.http.get<Attachment[]>(url);
  }

  get(id: number): Observable<Attachment> {
    return this.http.get<Attachment>(`${this.baseUrl}/${id}`);
  }

  create(payload: AttachmentPayload): Observable<Attachment> {
    return this.http.post<Attachment>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<AttachmentPayload>): Observable<Attachment> {
    return this.http.put<Attachment>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
