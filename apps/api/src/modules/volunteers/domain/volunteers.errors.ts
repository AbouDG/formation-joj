import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const VOLUNTEER_ERROR_KINDS = {
  /** La date n'existe pas dans le calendrier, ou n'est pas au format AAAA-MM-JJ. */
  SLOT_DATE_INVALID: 'VALIDATION',
  /** Heures hors du format HH:MM, ou fin égale ou antérieure au début. */
  SLOT_TIME_RANGE_INVALID: 'VALIDATION',
  /** Capacité nulle, négative ou non entière. */
  SLOT_CAPACITY_INVALID: 'VALIDATION',
} as const satisfies Record<string, ErrorKind>;

export type VolunteerErrorCode = keyof typeof VOLUNTEER_ERROR_KINDS;

export class VolunteerError extends AppError<VolunteerErrorCode> {
  constructor(code: VolunteerErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, VOLUNTEER_ERROR_KINDS[code], message, details);
  }
}
