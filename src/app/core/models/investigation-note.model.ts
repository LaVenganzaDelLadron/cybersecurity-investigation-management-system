import { Note } from '../../types';

export type { Note };

export type InvestigationNote = Note;
export type InvestigationNotePayload = Omit<Note, 'id' | 'created_at' | 'updated_at' | 'analyst_id'>;
