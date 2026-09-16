import { Category } from '../../types';

export type { Category };

export type CategoryPayload = Omit<Category, 'id'>;
