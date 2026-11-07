// Lu par drizzle-kit pour générer les migrations : ce fichier n'importe que drizzle-orm.
import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  integer,
  pgTable,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { disciplines } from '../../disciplines/infra/disciplines.schema';

export const slots = pgTable(
  'slots',
  {
    id: uuid('id').primaryKey(),
    // Un créneau suit sa discipline : la supprimer supprime ses créneaux.
    disciplineId: uuid('discipline_id')
      .notNull()
      .references(() => disciplines.id, { onDelete: 'cascade' }),
    date: date('date', { mode: 'string' }).notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    capacity: integer('capacity').notNull(),
    // Précision milliseconde = celle de Date en JavaScript.
    createdAt: timestamp('created_at', { withTimezone: true, precision: 3 }).notNull(),
  },
  (table) => [
    // Les règles du domaine, garanties aussi par la base.
    check('slots_capacity_check', sql`${table.capacity} >= 1`),
    check('slots_time_range_check', sql`${table.endTime} > ${table.startTime}`),
  ],
);

export const registrations = pgTable(
  'registrations',
  {
    id: uuid('id').primaryKey(),
    slotId: uuid('slot_id')
      .notNull()
      .references(() => slots.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 254 }).notNull(),
    registeredAt: timestamp('registered_at', { withTimezone: true, precision: 3 }).notNull(),
  },
  // Le nombre d'inscrits d'un créneau se compte à chaque inscription.
  (table) => [index('registrations_slot_id_idx').on(table.slotId)],
);

export type SlotRow = typeof slots.$inferSelect;
export type RegistrationRow = typeof registrations.$inferSelect;
