import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AttachmentService } from './attachment.service';
import { CategoryService } from './category.service';
import { ChatService } from './chat.service';
import { IncidentService } from './incident.service';
import { InvestigationNoteService } from './investigation-note.service';
import { UserService } from './user.service';

describe('update services', () => {
  let http: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AttachmentService,
        CategoryService,
        ChatService,
        IncidentService,
        InvestigationNoteService,
        UserService,
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('updates an incident with PUT', () => {
    const payload = { title: 'Updated incident', status: 'investigating' };
    TestBed.inject(IncidentService).update(7, payload).subscribe();

    const request = http.expectOne(`${apiUrl}/incidents/7`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 7, ...payload });
  });

  it('refreshes a cached incident list when requested', () => {
    const service = TestBed.inject(IncidentService);
    service.list().subscribe();
    const firstRequest = http.expectOne(`${apiUrl}/incidents`);
    firstRequest.flush([{ id: 7, title: 'Original incident' }]);

    service.list().subscribe();
    expect(() => http.expectOne(`${apiUrl}/incidents`)).toThrow();

    service.list(true).subscribe();
    const refreshRequest = http.expectOne(`${apiUrl}/incidents`);
    expect(refreshRequest.request.method).toBe('GET');
    refreshRequest.flush([{ id: 7, title: 'Updated incident' }]);
  });

  it('updates a category with PUT', () => {
    const payload = { name: 'Updated category' };
    TestBed.inject(CategoryService).update(3, payload).subscribe();

    const request = http.expectOne(`${apiUrl}/categories/3`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 3, ...payload });
  });

  it('updates a chat and sends only the message', () => {
    const payload = { message: 'Regenerate this response' };
    TestBed.inject(ChatService).update(4, payload).subscribe();

    const request = http.expectOne(`${apiUrl}/chats/4`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 4, userinput: payload.message, response: 'Updated response' });
  });

  it('updates attachment metadata with PUT', () => {
    const payload = { incident_id: 9, filename: 'evidence.txt', filetype: 'text/plain' };
    TestBed.inject(AttachmentService).update(5, payload).subscribe();

    const request = http.expectOne(`${apiUrl}/attachments/5`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 5, ...payload });
  });

  it('updates an investigation note with PUT', () => {
    const payload = { incident_id: 9, note: 'Updated finding' };
    TestBed.inject(InvestigationNoteService).update(8, payload).subscribe();

    const request = http.expectOne(`${apiUrl}/investigation-notes/8`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 8, ...payload });
  });

  it('updates a user with PUT', () => {
    const payload = { role: 'analyst' as const, status: 'active' };
    TestBed.inject(UserService).update(2, payload).subscribe();

    const request = http.expectOne(`${apiUrl}/users/2`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(payload);
    request.flush({ id: 2, email: 'analyst@example.com', ...payload });
  });
});
