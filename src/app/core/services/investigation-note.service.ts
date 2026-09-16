import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InvestigationNote,
  InvestigationNotePayload,
} from '../models/investigation-note.model';
import { RequestCacheService } from './request-cache.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class InvestigationNoteService {
  private readonly baseUrl = `${environment.apiUrl}/investigation-notes`;

  constructor(private readonly http: HttpClient, private readonly cache: RequestCacheService) {}

  list(incidentId?: number, refresh = false): Observable<InvestigationNote[]> {
    const url = incidentId ? `${this.baseUrl}?incident_id=${incidentId}` : this.baseUrl;
    return this.cache.get(`notes:${incidentId ?? 'all'}`, () => this.http.get<InvestigationNote[]>(url), refresh);
  }

  get(id: number): Observable<InvestigationNote> {
    return this.http.get<InvestigationNote>(`${this.baseUrl}/${id}`);
  }

  create(payload: InvestigationNotePayload): Observable<InvestigationNote> {
    return this.http.post<InvestigationNote>(this.baseUrl, payload).pipe(tap(() => this.cache.invalidate('notes')));
  }

  update(id: number, payload: Partial<InvestigationNotePayload>): Observable<InvestigationNote> {
    return this.http.put<InvestigationNote>(`${this.baseUrl}/${id}`, payload).pipe(tap(() => this.cache.invalidate('notes')));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(tap(() => this.cache.invalidate('notes')));
  }
}
