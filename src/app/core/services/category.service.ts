import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CategoryPayload } from '../models/category.model';
import { RequestCacheService } from './request-cache.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  constructor(private readonly http: HttpClient, private readonly cache: RequestCacheService) {}

  list(refresh = false): Observable<Category[]> {
    return this.cache.get('categories', () => this.http.get<Category[]>(this.baseUrl), refresh);
  }

  get(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  create(payload: CategoryPayload): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, payload).pipe(tap(() => this.cache.invalidate('categories')));
  }

  update(id: number, payload: Partial<CategoryPayload>): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${id}`, payload).pipe(tap(() => this.cache.invalidate('categories')));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(tap(() => this.cache.invalidate('categories')));
  }
}
