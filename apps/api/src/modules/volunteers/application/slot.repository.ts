import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';

/**
 * Port de persistance : ce dont les cas d'usage ont besoin, rien de plus.
 * Implémenté par DrizzleSlotRepository (infra) et InMemorySlotRepository (tests).
 */
export abstract class SlotRepository {
  /** Le créneau avec son nombre d'inscrits, ou null. */
  abstract findById(id: string): Promise<Slot | null>;
  abstract insert(slot: Slot): Promise<void>;
  /** Lève SLOT_FULL si le créneau est déjà complet au moment de l'écriture. */
  abstract addRegistration(registration: Registration): Promise<void>;
}
