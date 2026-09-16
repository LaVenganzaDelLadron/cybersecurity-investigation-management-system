import { Incident } from '../../types';

export type { Incident };

export interface IncidentPayload {
	category_id?: number;
	title: string;
	description: string;
	severity: string;
	status: string;
	location: string;
	incident_date: string;
	resolve_at?: string | null;
	assigned_to?: number | null;
}
