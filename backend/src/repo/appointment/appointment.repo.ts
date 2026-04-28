import { db } from '../../db';
import { appointment } from '../../db/schema';
import { AppointmentStatus } from '../../types/appointment.types';

export type CreateAppointmentRecord = {
  appointmentId: string;
  appointmentDate: Date;
  appointStatus: AppointmentStatus;
  requestId: string;
};

export async function createAppointmentRecord(data: CreateAppointmentRecord) {
  const [createdAppointment] = await db
    .insert(appointment)
    .values({
      appointmentId: data.appointmentId,
      appointmentDate: data.appointmentDate,
      appointStatus: data.appointStatus,
      requestId: data.requestId,
    })
    .returning();

  return createdAppointment;
}
