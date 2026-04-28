export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  POSTPONED = 'POSTPONED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type CreateAppointmentBody = {
  request_id: string;
  appointment_date: string;
  notes?: string;
};
