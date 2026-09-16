import { Routes } from '@angular/router';
import { AdminGuard } from './core/guards/admin.guard';
import { AnalystGuard } from './core/guards/analyst.guard';
import { AuthGuard } from './core/guards/auth.guard';
import { Login } from './pages/auth/login/login';
import { Signup } from './pages/auth/signup/signup';
import { Dashboard } from './pages/dashboard/dashboard';
import { IncidentList } from './pages/incidents/incident-list/incident-list';
import { IncidentDetails } from './pages/incidents/incident-details/incident-details';
import { CreateIncident } from './pages/incidents/create-incident/create-incident';
import { EditIncident } from './pages/incidents/edit-incident/edit-incident';
import { CategotyList } from './pages/categories/categoty-list/categoty-list';
import { UserList } from './pages/user/user-list/user-list';
import { NotesList } from './pages/investigation-notes/notes-list/notes-list';
import { AttachmentList } from './pages/attachements/attachment-list/attachment-list';
import { ChatAi } from './pages/chats/chat-ai/chat-ai';
import { AuditLogs } from './pages/audit-logs/audit-logs';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'signup',
    component: Signup,
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'incidents', component: IncidentList },
      { path: 'incidents/new', component: CreateIncident },
      { path: 'incidents/:id', component: IncidentDetails },
      { path: 'incidents/:id/edit', component: EditIncident },
      { path: 'categories', component: CategotyList, canActivate: [AdminGuard] },
      { path: 'users', component: UserList, canActivate: [AdminGuard] },
      { path: 'notes', component: NotesList, canActivate: [AnalystGuard] },
      { path: 'attachments', component: AttachmentList },
      { path: 'chat', component: ChatAi },
      { path: 'audit-logs', component: AuditLogs, canActivate: [AdminGuard] },
      { path: 'profile', component: Profile },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
