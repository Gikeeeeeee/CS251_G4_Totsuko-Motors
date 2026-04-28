import { randomUUID } from 'crypto';
import {
  createAppointmentRecord,
  getAppointmentsByRequestId as fetchAppointmentsByRequestId,
  getAppointmentById,
  updateAppointment,
  postponeAppointmentTransaction
} from '../../repo/appointment/appointment.repo';
import { AppointmentStatus, CreateAppointmentBody, UpdateAppointmentBody } from '../../types/appointment.types';

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
    notes: body.notes?.trim(),
    requestId: body.request_id,
  };

  return createAppointmentRecord(record);
}

export async function getAppointmentsByRequestId(requestId: string) {
  if (!requestId) {
    throw new Error('requestId is required');
  }

  return await fetchAppointmentsByRequestId(requestId);
}

export async function updateAppointmentStatus(appointmentId: string, body: UpdateAppointmentBody) {
  if (!appointmentId) {
    throw new Error('appointmentId is required');
  }

  const currentAppointment = await getAppointmentById(appointmentId);
  if (!currentAppointment) {
    throw new Error('Appointment not found');
  }

  // 1. Terminal state check
  if (currentAppointment.appointStatus !== AppointmentStatus.SCHEDULED) {
    throw new Error('Cannot update an appointment unless its current status is SCHEDULED');
  }

  const newStatus = body.status;

  // 2. Postpone logic
  if (newStatus === AppointmentStatus.POSTPONED) {
    if (!body.appointment_date) {
      throw new Error('appointment_date is required when postponing');
    }

    const newDate = new Date(body.appointment_date);
    if (isNaN(newDate.getTime())) {
      throw new Error('Invalid appointment_date format');
    }
    if (newDate < new Date()) {
      throw new Error('New appointment_date cannot be in the past');
    }

    const newRecord = {
      appointmentId: generateId('A'),
      appointmentDate: newDate,
      appointStatus: AppointmentStatus.SCHEDULED,
      notes: undefined, // New appointment might not inherit notes, or could inherit based on requirements. Instructions said "save updated notes" to the POSTPONED one.
      requestId: currentAppointment.requestId!,
    };

    return postponeAppointmentTransaction(appointmentId, body.notes, newRecord);
  }

  // 3. Normal update (CANCELLED, COMPLETED)
  // Ensure valid transition
  if (
    newStatus !== AppointmentStatus.CANCELLED &&
    newStatus !== AppointmentStatus.COMPLETED
  ) {
    throw new Error('Invalid status transition');
  }

  return updateAppointment(appointmentId, {
    appointStatus: newStatus,
    notes: body.notes,
  });
}
