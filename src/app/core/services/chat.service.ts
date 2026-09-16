import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatMessage, ChatRequest } from '../models/chat.model';
import { RequestCacheService } from './request-cache.service';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly baseUrl = `${environment.apiUrl}/chats`;

  constructor(private readonly http: HttpClient, private readonly cache: RequestCacheService) {}

  list(refresh = false): Observable<ChatMessage[]> {
    return this.cache.get('chats', () => this.http.get<ChatMessage[]>(this.baseUrl), refresh);
  }

  get(id: number): Observable<ChatMessage> {
    return this.http.get<ChatMessage>(`${this.baseUrl}/${id}`);
  }

  send(payload: ChatRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(this.baseUrl, payload).pipe(tap(() => this.cache.invalidate('chats')));
  }

  update(id: number, payload: ChatRequest): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.baseUrl}/${id}`, payload).pipe(tap(() => this.cache.invalidate('chats')));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(tap(() => this.cache.invalidate('chats')));
  }
}
