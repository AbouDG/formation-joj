import type { Registration } from '../domain/registration';
import type { RegistrationRow } from './volunteers.schema';

/** Entité → ligne de la table. */
export function toRow(registration: Registration): RegistrationRow {
  return {
    id: registration.id,
    slotId: registration.slotId,
    name: registration.name,
    email: registration.email,
    registeredAt: registration.registeredAt,
  };
}
