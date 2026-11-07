import { z } from 'zod';

/** Corps de `POST /api/slots` : date au format AAAA-MM-JJ, heures au format HH:MM. */
export const openSlotSchema = z
  .object({
    disciplineId: z.uuid(),
    date: z.iso.date(),
    startTime: z.iso.time({ precision: -1 }),
    endTime: z.iso.time({ precision: -1 }),
    capacity: z.int().min(1),
  })
  // Au format HH:MM, l'ordre alphabétique est l'ordre chronologique.
  .refine((input) => input.endTime > input.startTime, {
    message: 'The end time must be after the start time',
    path: ['endTime'],
  });
export type OpenSlotInput = z.infer<typeof openSlotSchema>;

export const VOLUNTEER_NAME_MAX_LENGTH = 100;
export const VOLUNTEER_EMAIL_MAX_LENGTH = 254;

/** Corps de `POST /api/slots/:id/registrations` : le bénévole s'identifie par son nom et son email. */
export const registerVolunteerSchema = z.object({
  name: z.string().trim().min(1).max(VOLUNTEER_NAME_MAX_LENGTH),
  email: z.string().trim().max(VOLUNTEER_EMAIL_MAX_LENGTH).pipe(z.email()),
});
export type RegisterVolunteerInput = z.infer<typeof registerVolunteerSchema>;

/** Paramètre `:id` des routes d'un créneau. */
export const slotIdParamsSchema = z.object({ id: z.uuid() });

/** Un créneau tel que l'API le renvoie, avec son nombre d'inscrits. */
export const slotSchema = z.object({
  id: z.uuid(),
  disciplineId: z.uuid(),
  date: z.iso.date(),
  startTime: z.iso.time({ precision: -1 }),
  endTime: z.iso.time({ precision: -1 }),
  capacity: z.int(),
  registeredCount: z.int(),
  createdAt: z.iso.datetime(),
});
export type SlotResponse = z.infer<typeof slotSchema>;

/** Une inscription telle que l'API la renvoie. */
export const registrationSchema = z.object({
  id: z.uuid(),
  slotId: z.uuid(),
  name: z.string(),
  email: z.string(),
  registeredAt: z.iso.datetime(),
});
export type RegistrationResponse = z.infer<typeof registrationSchema>;
