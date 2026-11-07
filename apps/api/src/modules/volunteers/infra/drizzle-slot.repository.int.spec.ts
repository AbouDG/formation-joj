import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { type DatabaseConnection, openDatabase } from '../../../core/database/database';
import { Discipline } from '../../disciplines/domain/discipline';
import { DrizzleDisciplineRepository } from '../../disciplines/infra/drizzle-discipline.repository';
import { Slot } from '../domain/slot';
import { DrizzleSlotRepository } from './drizzle-slot.repository';

const volunteer = (n: number) => ({
  id: randomUUID(),
  name: `Bénévole ${n}`,
  email: `benevole${n}@example.com`,
  now: new Date(),
});

describe('DrizzleSlotRepository (in-memory PGlite, migrations applied)', () => {
  let connection: DatabaseConnection;
  let repository: DrizzleSlotRepository;
  let disciplineId: string;

  const newSlot = (capacity = 2) =>
    Slot.create({
      id: randomUUID(),
      disciplineId,
      date: '2026-11-01',
      startTime: '09:00',
      endTime: '12:00',
      capacity,
      now: new Date('2026-10-31T09:00:00.123Z'),
    });

  beforeAll(async () => {
    connection = openDatabase({ pgliteDataDir: 'memory://' });
    await connection.migrate();
    repository = new DrizzleSlotRepository(connection.db);
    const lutte = Discipline.create({
      id: randomUUID(),
      name: 'Lutte',
      category: 'sports-de-combat',
      now: new Date(),
    });
    await new DrizzleDisciplineRepository(connection.db).insert(lutte);
    disciplineId = lutte.id;
  });

  afterAll(() => connection?.close());

  it('001-AS1: reads back exactly the slot it wrote, with no volunteer', async () => {
    const slot = newSlot();
    await repository.insert(slot);

    expect(await repository.findById(slot.id)).toEqual(slot);
    expect(await repository.findById(randomUUID())).toBeNull();
  });

  it('001-AS5: counts the registrations of a slot', async () => {
    const slot = newSlot();
    await repository.insert(slot);
    await repository.addRegistration(slot.register(volunteer(1)));

    expect((await repository.findById(slot.id))?.registeredCount).toBe(1);
  });

  it('001-AS7: keeps the capacity under concurrent registrations', async () => {
    const slot = newSlot(2);
    await repository.insert(slot);
    await repository.addRegistration(slot.register(volunteer(1)));

    // Deux bénévoles ont lu le créneau avec une place libre : le contrôle du domaine passe deux fois.
    const [first, second] = [1, 2].map(() => {
      const copy = Slot.restore({ ...slotProps(slot), registeredCount: 1 });
      return copy.register(volunteer(2));
    });
    const results = await Promise.allSettled([
      repository.addRegistration(first!),
      repository.addRegistration(second!),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected')).toMatchObject({
      reason: { code: 'SLOT_FULL', kind: 'CONFLICT' },
    });
    expect((await repository.findById(slot.id))?.registeredCount).toBe(2);
  });
});

function slotProps(slot: Slot) {
  return {
    id: slot.id,
    disciplineId: slot.disciplineId,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity: slot.capacity,
    registeredCount: slot.registeredCount,
    createdAt: slot.createdAt,
  };
}
