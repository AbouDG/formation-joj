import { VolunteerError } from './volunteers.errors';

export interface RegistrationProps {
  id: string;
  slotId: string;
  name: string;
  email: string;
  registeredAt: Date;
}

export interface NewRegistration {
  id: string;
  slotId: string;
  name: string;
  email: string;
  now: Date;
}

/** Un bénévole inscrit à un créneau, identifié par son nom et son email (pas de compte). */
export class Registration {
  private constructor(private readonly props: RegistrationProps) {}

  /** Créée par `Slot.register()`, qui vérifie la capacité. */
  static create({ id, slotId, name, email, now }: NewRegistration): Registration {
    return new Registration({
      id,
      slotId,
      name: validName(name),
      email: validEmail(email),
      registeredAt: now,
    });
  }

  /** Reconstruit une inscription depuis la persistance, sans rejouer les règles de création. */
  static restore(props: RegistrationProps): Registration {
    return new Registration({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get slotId(): string {
    return this.props.slotId;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get registeredAt(): Date {
    return this.props.registeredAt;
  }
}

// Volontairement simple : une partie locale, un @, un domaine avec un point, sans espace.
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new VolunteerError('REGISTRATION_NAME_REQUIRED', 'A volunteer needs a name');
  }
  return trimmed;
}

function validEmail(email: string): string {
  const trimmed = email.trim();
  if (!EMAIL_FORMAT.test(trimmed)) {
    throw new VolunteerError('REGISTRATION_EMAIL_INVALID', `${trimmed} is not a valid email`, {
      email: trimmed,
    });
  }
  return trimmed;
}
