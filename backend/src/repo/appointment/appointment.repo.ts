import { db } from '../../db';
import { eq, desc } from 'drizzle-orm';
import { appointment } from '../../db/schema';
import { AppointmentStatus } from '../../types/appointment.types';

export type CreateAppointmentRecord = {
  appointmentId: string;
  appointmentDate: Date;
  appointStatus: AppointmentStatus;
  notes?: string;
  requestId: string;
};

export async function createAppointmentRecord(data: CreateAppointmentRecord) {
  const [createdAppointment] = await db
    .insert(appointment)
    .values({
      appointmentId: data.appointmentId,
      appointmentDate: data.appointmentDate,
      appointStatus: data.appointStatus,
      notes: data.notes,
      requestId: data.requestId,
    })
    .returning();

  return createdAppointment;
}

export async function getAppointmentsByRequestId(requestId: string) {
  return db
    .select()
    .from(appointment)
    .where(eq(appointment.requestId, requestId))
    .orderBy(desc(appointment.createdAt));
}

export async function getAppointmentById(appointmentId: string) {
  const records = await db
    .select()
    .from(appointment)
    .where(eq(appointment.appointmentId, appointmentId));
  return records[0];
}

export async function updateAppointment(
  appointmentId: string,
  data: Partial<{ appointStatus: string; notes: string }>
) {
  const [updated] = await db
    .update(appointment)
    .set(data)
    .where(eq(appointment.appointmentId, appointmentId))
    .returning();
  return updated;
}

export async function postponeAppointmentTransaction(
  currentAppointmentId: string,
  currentNotes: string | undefined,
  newAppointmentRecord: CreateAppointmentRecord
) {
  return db.transaction(async (tx) => {
    // 1. Update current appointment to POSTPONED
    await tx
      .update(appointment)
      .set({ appointStatus: AppointmentStatus.POSTPONED, notes: currentNotes })
      .where(eq(appointment.appointmentId, currentAppointmentId));

    // 2. Create new appointment
    const [createdAppointment] = await tx
      .insert(appointment)
      .values({
        appointmentId: newAppointmentRecord.appointmentId,
        appointmentDate: newAppointmentRecord.appointmentDate,
        appointStatus: newAppointmentRecord.appointStatus,
        notes: newAppointmentRecord.notes,
        requestId: newAppointmentRecord.requestId,
      })
      .returning();

    return createdAppointment;
  });
}
