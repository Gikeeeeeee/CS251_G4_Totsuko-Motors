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

export type UpdateAppointmentBody = {
  status: AppointmentStatus;
  appointment_date?: string;
  notes?: string;
};

export type QuickCreateAppointmentBody = {
  platePrefix: string;
  plateNumber: string;
  province: string;
  startTime: string;       // "8:00", "8:30", ..., "18:00"
  endTime: string;
  appointmentDate: string; // "YYYY-MM-DD"
};
