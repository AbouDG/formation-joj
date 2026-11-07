import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { OpenSlotInput } from '@joj/shared';
import { GetDiscipline } from '../../../disciplines/application/use-cases/get-discipline';
import { Slot } from '../../domain/slot';
import { SlotRepository } from '../slot.repository';

@Injectable()
export class OpenSlot {
  constructor(
    private readonly slots: SlotRepository,
    private readonly getDiscipline: GetDiscipline,
  ) {}

  async execute(input: OpenSlotInput): Promise<Slot> {
    // Lève DISCIPLINE_NOT_FOUND ; la clé étrangère en base couvre une suppression simultanée.
    await this.getDiscipline.execute(input.disciplineId);
    const slot = Slot.create({ id: randomUUID(), ...input, now: new Date() });
    await this.slots.insert(slot);
    return slot;
  }
}
