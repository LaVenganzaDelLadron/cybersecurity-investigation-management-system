import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InvestigationNote,
  InvestigationNotePayload,
} from '../models/investigation-note.model';

@Injectable({ providedIn: 'root' })
export class InvestigationNoteService {
  private readonly baseUrl = `${environment.apiUrl}/investigation-notes`;

  constructor(private readonly http: HttpClient) {}

  list(incidentId?: number): Observable<InvestigationNote[]> {
    const url = incidentId ? `${this.baseUrl}?incident_id=${incidentId}` : this.baseUrl;
    return this.http.get<InvestigationNote[]>(url);
  }

  get(id: number): Observable<InvestigationNote> {
    return this.http.get<InvestigationNote>(`${this.baseUrl}/${id}`);
  }

  create(payload: InvestigationNotePayload): Observable<InvestigationNote> {
    return this.http.post<InvestigationNote>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<InvestigationNotePayload>): Observable<InvestigationNote> {
    return this.http.put<InvestigationNote>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
