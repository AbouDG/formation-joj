import { describe, expect, it } from 'vitest';
import { openSlotSchema } from './volunteers.ts';

const DISCIPLINE_ID = '0199f5c2-0000-7000-8000-000000000001';
const valid = {
  disciplineId: DISCIPLINE_ID,
  date: '2026-11-01',
  startTime: '09:00',
  endTime: '12:00',
  capacity: 2,
};

describe('openSlotSchema', () => {
  it('001-AS1: accepts a discipline, a date, a time range and a capacity', () => {
    expect(openSlotSchema.parse(valid)).toEqual(valid);
  });

  it.each([
    { startTime: '12:00', endTime: '12:00' },
    { startTime: '12:00', endTime: '09:00' },
  ])('001-AS3: rejects an end time not after the start time (%j)', (times) => {
    expect(openSlotSchema.safeParse({ ...valid, ...times }).success).toBe(false);
  });

  it.each(['2026-02-30', '2026-13-01', '01/11/2026', ''])(
    '001-AS3: rejects an invalid date (%j)',
    (date) => {
      expect(openSlotSchema.safeParse({ ...valid, date }).success).toBe(false);
    },
  );

  it.each([0, -1, 1.5])('001-AS4: rejects an invalid capacity (%j)', (capacity) => {
    expect(openSlotSchema.safeParse({ ...valid, capacity }).success).toBe(false);
  });
});
