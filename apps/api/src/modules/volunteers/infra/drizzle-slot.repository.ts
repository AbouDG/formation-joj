import { Inject, Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import type { Database } from '../../../core/database/database';
import { DATABASE } from '../../../core/database/database.module';
import { SlotRepository } from '../application/slot.repository';
import type { Registration } from '../domain/registration';
import type { Slot } from '../domain/slot';
import { slotFull } from '../domain/volunteers.errors';
import { toRow as registrationToRow } from './registration.mapper';
import { toDomain, toRow } from './slot.mapper';
import { registrations, slots } from './volunteers.schema';

@Injectable()
export class DrizzleSlotRepository extends SlotRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {
    super();
  }

  async findById(id: string): Promise<Slot | null> {
    const [row] = await this.db.select().from(slots).where(eq(slots.id, id)).limit(1);
    if (!row) return null;
    return toDomain(row, await this.countRegistrations(this.db, id));
  }

  async insert(slot: Slot): Promise<void> {
    await this.db.insert(slots).values(toRow(slot));
  }

  async addRegistration(registration: Registration): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Le verrou sur la ligne du créneau fait passer les inscriptions concurrentes une par une :
      // la seconde recompte après que la première a écrit.
      const [slot] = await tx
        .select({ id: slots.id, capacity: slots.capacity })
        .from(slots)
        .where(eq(slots.id, registration.slotId))
        .for('update');
      if (slot && (await this.countRegistrations(tx, slot.id)) >= slot.capacity) {
        throw slotFull(slot.id, slot.capacity);
      }
      await tx.insert(registrations).values(registrationToRow(registration));
    });
  }

  private async countRegistrations(db: Pick<Database, 'select'>, slotId: string): Promise<number> {
    const [result] = await db
      .select({ value: count() })
      .from(registrations)
      .where(eq(registrations.slotId, slotId));
    return result?.value ?? 0;
  }
}
