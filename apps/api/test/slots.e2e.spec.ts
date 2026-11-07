import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import { disciplineSchema, registrationSchema, slotSchema } from '@joj/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './create-test-app';

describe('/api/slots (e2e)', () => {
  let app: INestApplication;
  let disciplineId: string;
  const api = () => request(app.getHttpServer());
  const slotBody = () => ({
    disciplineId,
    date: '2026-11-01',
    startTime: '09:00',
    endTime: '12:00',
    capacity: 2,
  });
  const openSlot = async () =>
    slotSchema.parse((await api().post('/api/slots').send(slotBody()).expect(201)).body);
  const volunteer = (n: number) => ({ name: `Bénévole ${n}`, email: `benevole${n}@example.com` });

  beforeAll(async () => {
    app = await createTestApp();
    const created = await api()
      .post('/api/disciplines')
      .send({ name: 'Lutte', category: 'sports-de-combat' })
      .expect(201);
    disciplineId = disciplineSchema.parse(created.body).id;
  });

  afterAll(() => app?.close());

  it('001-AS1: opens a slot (201) with its values and no volunteer', async () => {
    expect(await openSlot()).toMatchObject({ ...slotBody(), registeredCount: 0 });
  });

  it('001-AS2: rejects a slot for an unknown discipline (404)', async () => {
    const response = await api()
      .post('/api/slots')
      .send({ ...slotBody(), disciplineId: randomUUID() })
      .expect(404);

    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
    expect(response.body).toMatchObject({ status: 404, code: 'DISCIPLINE_NOT_FOUND' });
  });

  it('001-AS3: rejects an end time not after the start time (400)', async () => {
    const response = await api()
      .post('/api/slots')
      .send({ ...slotBody(), startTime: '12:00', endTime: '09:00' })
      .expect(400);

    expect(response.body).toMatchObject({ status: 400, code: 'VALIDATION_FAILED' });
    expect(response.body.errors).toEqual([expect.objectContaining({ path: 'endTime' })]);
  });

  it('001-AS4: rejects a capacity of 0 (400)', async () => {
    const response = await api()
      .post('/api/slots')
      .send({ ...slotBody(), capacity: 0 })
      .expect(400);

    expect(response.body.errors).toEqual([expect.objectContaining({ path: 'capacity' })]);
  });

  it('001-AS5: registers a volunteer (201) with a trimmed name and email', async () => {
    const slot = await openSlot();
    const response = await api()
      .post(`/api/slots/${slot.id}/registrations`)
      .send({ name: ' Awa Ndiaye ', email: '  awa@example.com  ' })
      .expect(201);

    expect(registrationSchema.parse(response.body)).toMatchObject({
      slotId: slot.id,
      name: 'Awa Ndiaye',
      email: 'awa@example.com',
    });
  });

  it('001-AS6: rejects a blank name or a malformed email (400)', async () => {
    const slot = await openSlot();
    const response = await api()
      .post(`/api/slots/${slot.id}/registrations`)
      .send({ name: ' ', email: 'awa' })
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'name' }),
        expect.objectContaining({ path: 'email' }),
      ]),
    );
  });

  it('001-AS7: rejects a third volunteer on a slot of capacity 2 (409)', async () => {
    const slot = await openSlot();
    const register = (n: number) =>
      api().post(`/api/slots/${slot.id}/registrations`).send(volunteer(n));
    await register(1).expect(201);
    await register(2).expect(201);

    const response = await register(3).expect(409);
    expect(response.body).toMatchObject({ status: 409, code: 'SLOT_FULL' });
  });

  it('001-AS8: rejects a registration on an unknown slot (404)', async () => {
    const response = await api()
      .post(`/api/slots/${randomUUID()}/registrations`)
      .send(volunteer(1))
      .expect(404);

    expect(response.body).toMatchObject({ status: 404, code: 'SLOT_NOT_FOUND' });
  });
});
