import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChatMessage, ChatRequest } from '../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly baseUrl = `${environment.apiUrl}/chats`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(this.baseUrl);
  }

  get(id: number): Observable<ChatMessage> {
    return this.http.get<ChatMessage>(`${this.baseUrl}/${id}`);
  }

  send(payload: ChatRequest): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(this.baseUrl, payload);
  }

  update(id: number, payload: ChatRequest): Observable<ChatMessage> {
    return this.http.put<ChatMessage>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
