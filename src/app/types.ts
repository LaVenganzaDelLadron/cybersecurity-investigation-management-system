export type UserRole = 'admin' | 'analyst' | 'user';

export interface UserProfile {
  id?: number;
  email: string;
  firstname?: string;
  lastname?: string;
  name?: string;
  full_name?: string;
  role: UserRole;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token?: string;
  token?: string;
  user?: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface Incident {
  id: number;
  user_id?: number;
  title: string;
  description?: string;
  status: string;
  severity: string;
  category_id?: number;
  assigned_to?: number | null;
  location?: string;
  incident_date?: string;
  resolve_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id: number;
  incident_id: number;
  analyst_id?: number;
  note: string;
  recommendation?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Attachment {
  id: number;
  incident_id?: number;
  filename: string;
  filepath?: string;
  filetype?: string;
  uploaded_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: number;
  user_id?: number;
  userinput: string;
  response?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSummary {
  id: number;
  email: string;
  role: UserRole;
  status: string;
  firstname?: string;
  lastname?: string;
  full_name?: string;
}

export interface AuditLogEntry {
  id: number;
  actor_id?: number;
  action: string;
  resource_type?: string;
  resource_id?: number;
  details?: string;
  created_at?: string;
}
