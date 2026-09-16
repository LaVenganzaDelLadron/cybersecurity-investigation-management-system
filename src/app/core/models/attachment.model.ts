import { Attachment } from '../../types';

export type { Attachment };

export type AttachmentPayload = Omit<Attachment, 'id' | 'created_at' | 'updated_at' | 'uploaded_by'>;
