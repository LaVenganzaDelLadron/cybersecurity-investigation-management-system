import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Incident, IncidentPayload } from '../models/incident.model';
import { RequestCacheService } from './request-cache.service';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly baseUrl = `${environment.apiUrl}/incidents`;

  constructor(private readonly http: HttpClient, private readonly cache: RequestCacheService) {}

  list(refresh = false): Observable<Incident[]> {
    return this.cache.get('incidents', () => this.http.get<Incident[]>(this.baseUrl), refresh);
  }

  get(id: number): Observable<Incident> {
    return this.http.get<Incident>(`${this.baseUrl}/${id}`);
  }

  create(payload: IncidentPayload): Observable<Incident> {
    return this.http.post<Incident>(this.baseUrl, payload).pipe(tap(() => this.cache.invalidate('incidents')));
  }

  update(id: number, payload: Partial<IncidentPayload>): Observable<Incident> {
    return this.http.put<Incident>(`${this.baseUrl}/${id}`, payload).pipe(tap(() => this.cache.invalidate('incidents')));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(tap(() => this.cache.invalidate('incidents')));
  }
}
