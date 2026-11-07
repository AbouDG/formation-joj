import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { RegisterVolunteerInput } from '@joj/shared';
import type { Registration } from '../../domain/registration';
import { slotNotFound } from '../../domain/volunteers.errors';
import { SlotRepository } from '../slot.repository';

@Injectable()
export class RegisterVolunteer {
  constructor(private readonly slots: SlotRepository) {}

  async execute(slotId: string, input: RegisterVolunteerInput): Promise<Registration> {
    const slot = await this.slots.findById(slotId);
    if (!slot) throw slotNotFound(slotId);
    // Message clair dans le cas courant ; le repository garantit la capacité sous concurrence.
    const registration = slot.register({ id: randomUUID(), ...input, now: new Date() });
    await this.slots.addRegistration(registration);
    return registration;
  }
}
