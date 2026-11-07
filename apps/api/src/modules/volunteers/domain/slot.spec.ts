import { describe, expect, it } from 'vitest';
import { Slot } from './slot';
import { VolunteerError } from './volunteers.errors';

const NOW = new Date('2026-10-31T09:00:00.000Z');
const ID = '0199f5c2-0000-7000-8000-000000000010';
const DISCIPLINE_ID = '0199f5c2-0000-7000-8000-000000000001';
const valid = {
  id: ID,
  disciplineId: DISCIPLINE_ID,
  date: '2026-11-01',
  startTime: '09:00',
  endTime: '12:00',
  capacity: 2,
  now: NOW,
};

describe('Slot', () => {
  it('001-AS1: opens a slot with its values and no volunteer yet', () => {
    expect(Slot.create(valid)).toMatchObject({
      id: ID,
      disciplineId: DISCIPLINE_ID,
      date: '2026-11-01',
      startTime: '09:00',
      endTime: '12:00',
      capacity: 2,
      registeredCount: 0,
      createdAt: NOW,
    });
  });

  it.each([
    { startTime: '12:00', endTime: '12:00' },
    { startTime: '12:00', endTime: '09:00' },
    { startTime: '9h', endTime: '12:00' },
  ])('001-AS3: rejects an end time not after the start time (%j)', (times) => {
    expect(() => Slot.create({ ...valid, ...times })).toThrow(
      expect.objectContaining({ code: 'SLOT_TIME_RANGE_INVALID', kind: 'VALIDATION' }),
    );
  });

  it.each(['2026-02-30', '2026-13-01', '01/11/2026'])(
    '001-AS3: rejects a date that is not on the calendar (%j)',
    (date) => {
      expect(() => Slot.create({ ...valid, date })).toThrow(
        expect.objectContaining({ code: 'SLOT_DATE_INVALID', kind: 'VALIDATION' }),
      );
    },
  );

  it.each([0, -1, 1.5])('001-AS4: rejects an invalid capacity (%j)', (capacity) => {
    expect(() => Slot.create({ ...valid, capacity })).toThrow(VolunteerError);
    expect(() => Slot.create({ ...valid, capacity })).toThrow(
      expect.objectContaining({ code: 'SLOT_CAPACITY_INVALID', kind: 'VALIDATION' }),
    );
  });
});
