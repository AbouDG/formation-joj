import { describe, expect, it } from 'vitest';
import { Registration } from './registration';

const NOW = new Date('2026-10-31T10:00:00.000Z');
const ID = '0199f5c2-0000-7000-8000-000000000020';
const SLOT_ID = '0199f5c2-0000-7000-8000-000000000010';
const valid = { id: ID, slotId: SLOT_ID, name: 'Awa Ndiaye', email: 'awa@example.com', now: NOW };

describe('Registration', () => {
  it('001-AS5: registers a volunteer with a trimmed name and email', () => {
    expect(
      Registration.create({ ...valid, name: '  Awa Ndiaye ', email: '  awa@example.com  ' }),
    ).toMatchObject({
      id: ID,
      slotId: SLOT_ID,
      name: 'Awa Ndiaye',
      email: 'awa@example.com',
      registeredAt: NOW,
    });
  });

  it.each(['', '   '])('001-AS6: rejects a blank name (%j)', (name) => {
    expect(() => Registration.create({ ...valid, name })).toThrow(
      expect.objectContaining({ code: 'REGISTRATION_NAME_REQUIRED', kind: 'VALIDATION' }),
    );
  });

  it.each(['', 'awa', 'awa@', '@example.com', 'awa@example', 'awa ndiaye@example.com'])(
    '001-AS6: rejects a malformed email (%j)',
    (email) => {
      expect(() => Registration.create({ ...valid, email })).toThrow(
        expect.objectContaining({ code: 'REGISTRATION_EMAIL_INVALID', kind: 'VALIDATION' }),
      );
    },
  );
});
