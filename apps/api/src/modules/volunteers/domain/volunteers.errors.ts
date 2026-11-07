import { AppError, type ErrorKind } from '../../../core/errors/app-error';

/** Codes stables exposés aux clients ; la catégorie décide du statut HTTP. */
const VOLUNTEER_ERROR_KINDS = {
  /** La date n'existe pas dans le calendrier, ou n'est pas au format AAAA-MM-JJ. */
  SLOT_DATE_INVALID: 'VALIDATION',
  /** Heures hors du format HH:MM, ou fin égale ou antérieure au début. */
  SLOT_TIME_RANGE_INVALID: 'VALIDATION',
  /** Capacité nulle, négative ou non entière. */
  SLOT_CAPACITY_INVALID: 'VALIDATION',
  /** Nom vide, ou fait seulement d'espaces. */
  REGISTRATION_NAME_REQUIRED: 'VALIDATION',
  REGISTRATION_EMAIL_INVALID: 'VALIDATION',
  /** Le créneau compte déjà autant d'inscrits que sa capacité. */
  SLOT_FULL: 'CONFLICT',
} as const satisfies Record<string, ErrorKind>;

export type VolunteerErrorCode = keyof typeof VOLUNTEER_ERROR_KINDS;

export class VolunteerError extends AppError<VolunteerErrorCode> {
  constructor(code: VolunteerErrorCode, message: string, details?: Record<string, unknown>) {
    super(code, VOLUNTEER_ERROR_KINDS[code], message, details);
  }
}

export function slotFull(id: string, capacity: number): VolunteerError {
  return new VolunteerError('SLOT_FULL', `Slot ${id} is full (${capacity} volunteers)`, {
    id,
    capacity,
  });
}
