import { Slot } from '../domain/slot';
import type { SlotRow } from './volunteers.schema';

/** Ligne de la table + nombre d'inscrits → entité. Postgres renvoie HH:MM:SS, le domaine HH:MM. */
export function toDomain(row: SlotRow, registeredCount: number): Slot {
  return Slot.restore({
    id: row.id,
    disciplineId: row.disciplineId,
    date: row.date,
    startTime: row.startTime.slice(0, 5),
    endTime: row.endTime.slice(0, 5),
    capacity: row.capacity,
    registeredCount,
    createdAt: row.createdAt,
  });
}

/** Entité → ligne de la table ; le nombre d'inscrits n'est pas stocké. */
export function toRow(slot: Slot): SlotRow {
  return {
    id: slot.id,
    disciplineId: slot.disciplineId,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity: slot.capacity,
    createdAt: slot.createdAt,
  };
}
