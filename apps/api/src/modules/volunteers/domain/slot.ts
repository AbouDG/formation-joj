import { VolunteerError } from './volunteers.errors';

export interface SlotProps {
  id: string;
  disciplineId: string;
  /** Date du calendrier, au format AAAA-MM-JJ. */
  date: string;
  /** Heures au format HH:MM. */
  startTime: string;
  endTime: string;
  capacity: number;
  registeredCount: number;
  createdAt: Date;
}

export interface NewSlot {
  id: string;
  disciplineId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  now: Date;
}

/** Un créneau d'accueil d'une discipline : jamais plus d'inscrits que sa capacité. */
export class Slot {
  private constructor(private readonly props: SlotProps) {}

  /** Le domaine revérifie les règles : il ne fait pas confiance à la validation HTTP. */
  static create({ id, disciplineId, date, startTime, endTime, capacity, now }: NewSlot): Slot {
    assertValidTimeRange(startTime, endTime);
    return new Slot({
      id,
      disciplineId,
      date: validDate(date),
      startTime,
      endTime,
      capacity: validCapacity(capacity),
      registeredCount: 0,
      createdAt: now,
    });
  }

  /** Reconstruit un créneau depuis la persistance, sans rejouer les règles de création. */
  static restore(props: SlotProps): Slot {
    return new Slot({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get disciplineId(): string {
    return this.props.disciplineId;
  }

  get date(): string {
    return this.props.date;
  }

  get startTime(): string {
    return this.props.startTime;
  }

  get endTime(): string {
    return this.props.endTime;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get registeredCount(): number {
    return this.props.registeredCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}

const DATE_FORMAT = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_FORMAT = /^([01]\d|2[0-3]):[0-5]\d$/;

function validDate(date: string): string {
  const match = DATE_FORMAT.exec(date);
  // Date.UTC « corrige » le 30 février en 2 mars : on vérifie qu'on relit les mêmes valeurs.
  const parsed = match ? new Date(Date.UTC(+match[1]!, +match[2]! - 1, +match[3]!)) : null;
  if (!parsed || parsed.toISOString().slice(0, 10) !== date) {
    throw new VolunteerError('SLOT_DATE_INVALID', `${date} is not a calendar date`, { date });
  }
  return date;
}

function assertValidTimeRange(startTime: string, endTime: string): void {
  // Au format HH:MM, l'ordre alphabétique est l'ordre chronologique.
  if (!TIME_FORMAT.test(startTime) || !TIME_FORMAT.test(endTime) || endTime <= startTime) {
    throw new VolunteerError(
      'SLOT_TIME_RANGE_INVALID',
      'A slot needs HH:MM times, with the end after the start',
      { startTime, endTime },
    );
  }
}

function validCapacity(capacity: number): number {
  if (!Number.isInteger(capacity) || capacity < 1) {
    throw new VolunteerError(
      'SLOT_CAPACITY_INVALID',
      'A slot capacity is a whole number of at least 1',
      {
        capacity,
      },
    );
  }
  return capacity;
}
