import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Incident, IncidentPayload } from '../models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly baseUrl = `${environment.apiUrl}/incidents`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<Incident[]> {
    return this.http.get<Incident[]>(this.baseUrl);
  }

  get(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.baseUrl}/${id}`);
  }

  create(payload: IncidentPayload): Observable<Incident> {
    return this.http.post<Incident>(this.baseUrl, payload);
  }

  update(id: number, payload: Partial<IncidentPayload>): Observable<Incident> {
    return this.http.put<Incident>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
