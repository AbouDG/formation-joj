import { Registration } from '../../domain/registration';
import { Slot } from '../../domain/slot';
import { slotFull } from '../../domain/volunteers.errors';
import { SlotRepository } from '../slot.repository';

/** Fake fidèle au contrat du port (capacité garantie à l'écriture), pour tester sans base. */
export class InMemorySlotRepository extends SlotRepository {
  private readonly slots = new Map<string, Slot>();
  private readonly registrations: Registration[] = [];

  /** Pour vérifier qu'un refus n'a rien enregistré. */
  get slotCount(): number {
    return this.slots.size;
  }

  async findById(id: string): Promise<Slot | null> {
    const found = this.slots.get(id);
    return found ? this.withCount(found) : null;
  }

  async insert(slot: Slot): Promise<void> {
    this.slots.set(slot.id, this.withCount(slot));
  }

  async addRegistration(registration: Registration): Promise<void> {
    const slot = this.slots.get(registration.slotId);
    if (!slot) return;
    // Comme le verrou en base : la capacité est recomptée au moment d'écrire.
    if (this.countFor(slot.id) >= slot.capacity) throw slotFull(slot.id, slot.capacity);
    this.registrations.push(
      Registration.restore({
        id: registration.id,
        slotId: registration.slotId,
        name: registration.name,
        email: registration.email,
        registeredAt: registration.registeredAt,
      }),
    );
  }

  private countFor(slotId: string): number {
    return this.registrations.filter((registration) => registration.slotId === slotId).length;
  }

  /** Copie avec le nombre d'inscrits stocké : un test ne voit que ce qui a été persisté. */
  private withCount(slot: Slot): Slot {
    return Slot.restore({
      id: slot.id,
      disciplineId: slot.disciplineId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: slot.capacity,
      registeredCount: this.countFor(slot.id),
      createdAt: slot.createdAt,
    });
  }
}
