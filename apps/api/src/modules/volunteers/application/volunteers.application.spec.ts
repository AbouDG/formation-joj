import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { InMemoryDisciplineRepository } from '../../disciplines/application/testing/in-memory-discipline.repository';
import { GetDiscipline } from '../../disciplines/application/use-cases/get-discipline';
import { Discipline } from '../../disciplines/domain/discipline';
import { InMemorySlotRepository } from './testing/in-memory-slot.repository';
import { OpenSlot } from './use-cases/open-slot';
import { RegisterVolunteer } from './use-cases/register-volunteer';

async function setup() {
  const disciplines = new InMemoryDisciplineRepository();
  const lutte = Discipline.create({
    id: randomUUID(),
    name: 'Lutte',
    category: 'sports-de-combat',
    now: new Date(),
  });
  await disciplines.insert(lutte);
  const slots = new InMemorySlotRepository();
  const openSlot = new OpenSlot(slots, new GetDiscipline(disciplines));
  const registerVolunteer = new RegisterVolunteer(slots);
  const slotOfTwo = () =>
    openSlot.execute({
      disciplineId: lutte.id,
      date: '2026-11-01',
      startTime: '09:00',
      endTime: '12:00',
      capacity: 2,
    });
  return { lutte, slots, openSlot, registerVolunteer, slotOfTwo };
}

const volunteer = (n: number) => ({ name: `Bénévole ${n}`, email: `benevole${n}@example.com` });

describe('volunteers (application layer)', () => {
  it('001-AS1: opens a slot in an existing discipline, with no volunteer yet', async () => {
    const { lutte, slots, slotOfTwo } = await setup();
    const slot = await slotOfTwo();

    expect(slot).toMatchObject({
      disciplineId: lutte.id,
      date: '2026-11-01',
      startTime: '09:00',
      endTime: '12:00',
      capacity: 2,
      registeredCount: 0,
    });
    expect(await slots.findById(slot.id)).toEqual(slot);
  });

  it('001-AS2: refuses a slot for an unknown discipline', async () => {
    const { slots, openSlot } = await setup();
    await expect(
      openSlot.execute({
        disciplineId: randomUUID(),
        date: '2026-11-01',
        startTime: '09:00',
        endTime: '12:00',
        capacity: 2,
      }),
    ).rejects.toMatchObject({ code: 'DISCIPLINE_NOT_FOUND', kind: 'NOT_FOUND' });
    expect(slots.slotCount).toBe(0);
  });

  it('001-AS5: registers a volunteer with a trimmed name and email', async () => {
    const { slots, registerVolunteer, slotOfTwo } = await setup();
    const slot = await slotOfTwo();
    const registration = await registerVolunteer.execute(slot.id, {
      name: ' Awa Ndiaye ',
      email: '  awa@example.com  ',
    });

    expect(registration).toMatchObject({
      slotId: slot.id,
      name: 'Awa Ndiaye',
      email: 'awa@example.com',
    });
    expect((await slots.findById(slot.id))?.registeredCount).toBe(1);
  });

  it('001-AS7: refuses a third volunteer on a slot of capacity 2', async () => {
    const { slots, registerVolunteer, slotOfTwo } = await setup();
    const slot = await slotOfTwo();
    await registerVolunteer.execute(slot.id, volunteer(1));
    await registerVolunteer.execute(slot.id, volunteer(2));

    await expect(registerVolunteer.execute(slot.id, volunteer(3))).rejects.toMatchObject({
      code: 'SLOT_FULL',
      kind: 'CONFLICT',
    });
    expect((await slots.findById(slot.id))?.registeredCount).toBe(2);
  });

  it('001-AS7: keeps the capacity when two volunteers take the last place at once', async () => {
    const { slots, registerVolunteer, slotOfTwo } = await setup();
    const slot = await slotOfTwo();
    await registerVolunteer.execute(slot.id, volunteer(1));

    const results = await Promise.allSettled([
      registerVolunteer.execute(slot.id, volunteer(2)),
      registerVolunteer.execute(slot.id, volunteer(3)),
    ]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected')).toMatchObject({
      reason: { code: 'SLOT_FULL' },
    });
    expect((await slots.findById(slot.id))?.registeredCount).toBe(2);
  });

  it('001-AS8: refuses a registration on an unknown slot', async () => {
    const { registerVolunteer } = await setup();
    await expect(registerVolunteer.execute(randomUUID(), volunteer(1))).rejects.toMatchObject({
      code: 'SLOT_NOT_FOUND',
      kind: 'NOT_FOUND',
    });
  });
});
