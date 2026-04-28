import { randomUUID } from 'crypto';
import { createAppointmentRecord } from '../../repo/appointment/appointment.repo';
import { AppointmentStatus, CreateAppointmentBody } from '../../types/appointment.types';

function generateId(prefix: string) {
  return `${prefix}${randomUUID().replace(/-/g, '').slice(0, 9)}`.toUpperCase();
}

export async function createAppointment(body: CreateAppointmentBody) {
  if (!body.request_id) {
    throw new Error('request_id is required');
  }

  if (!body.appointment_date) {
    throw new Error('appointment_date is required');
  }

  const appointmentDate = new Date(body.appointment_date);

  if (isNaN(appointmentDate.getTime())) {
    throw new Error('Invalid appointment_date format');
  }

  if (appointmentDate < new Date()) {
    throw new Error('appointment_date cannot be in the past');
  }

  const record = {
    appointmentId: generateId('A'),
    appointmentDate: appointmentDate,
    appointStatus: AppointmentStatus.SCHEDULED,
    requestId: body.request_id,
  };

  return createAppointmentRecord(record);
}
