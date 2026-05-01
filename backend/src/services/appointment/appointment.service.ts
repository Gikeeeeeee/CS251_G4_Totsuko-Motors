import { randomUUID } from 'crypto';
import {
  createAppointmentRecord,
  getAppointmentsByRequestId as fetchAppointmentsByRequestId,
  getAppointmentById,
  updateAppointment,
  postponeAppointmentTransaction,
  findVehicleByPlate,
  findLatestServiceRequestByVehicleId,
  findAllActiveAppointments,
} from '../../repo/appointment/appointment.repo';
import {
  AppointmentStatus,
  CreateAppointmentBody,
  UpdateAppointmentBody,
  QuickCreateAppointmentBody,
} from '../../types/appointment.types';


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


export async function quickCreateAppointmentFromForm(body: QuickCreateAppointmentBody) {
  // validate fields
  if (!body.platePrefix || !body.plateNumber) {
    throw new Error('platePrefix และ plateNumber required');
  }
  if (!body.startTime || !body.endTime) {
    throw new Error('startTime และ endTime required');
  }
  if (!body.appointmentDate) {
    throw new Error('appointmentDate required');
  }

  // หา vehicle จาก plate (รวม prefix + เลข เป็นรูปแบบเดียวกับ DB)
  const fullPlate = `${body.platePrefix} ${body.plateNumber}`.trim();
  const targetVehicle = await findVehicleByPlate(fullPlate);
  if (!targetVehicle) {
    throw new Error(`ไม่พบรถทะเบียน "${fullPlate}" ในระบบ`);
  }

  // หา service request ล่าสุดของรถคันนี้
  const targetRequest = await findLatestServiceRequestByVehicleId(targetVehicle.vehicleId);
  if (!targetRequest) {
    throw new Error('รถคันนี้ยังไม่มีใบแจ้งซ่อมในระบบ');
  }

  // รวมวัน + เวลาเริ่ม → Date object
  const [hours, minutes] = body.startTime.split(':').map(Number);
  const appointmentDateTime = new Date(body.appointmentDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);

  if (isNaN(appointmentDateTime.getTime())) {
    throw new Error('Invalid appointment date/time');
  }

  // เช็คเฉพาะวัน ไม่เช็คเวลา — อนุญาตให้นัดในวันนี้ได้ทุกช่วงเวลา
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (appointmentDateTime < startOfToday) {
    throw new Error('appointment_date cannot be in the past');
  }

  // encode field พิเศษใน notes (เพราะ schema ไม่มี column สำหรับ field พวกนี้)
  const extraInfo = JSON.stringify({
    plate: fullPlate,
    province: body.province,
    startTime: body.startTime,
    endTime: body.endTime,
  });

  // สร้าง appointment record
  return createAppointmentRecord({
    appointmentId: generateId('A'),
    appointmentDate: appointmentDateTime,
    appointStatus: AppointmentStatus.SCHEDULED,
    notes: extraInfo,
    requestId: targetRequest.requestId,
  });
}

// ดึง appointment ทั้งหมดที่ยังไม่ถูกยกเลิก (สำหรับหน้า scheduling)
export async function getAllActiveAppointmentsForBoard() {
  const rows = await findAllActiveAppointments();

  return rows.map((row) => {
    let extra: { plate?: string; province?: string; startTime?: string; endTime?: string } = {};
    try {
      if (row.notes) {
        extra = JSON.parse(row.notes);
      }
    } catch {
      // notes ไม่ใช่ JSON (อาจเป็น appointment เก่าที่ใส่ notes แบบ free-text)
    }

    return {
      appointmentId: row.appointmentId,
      appointmentDate: row.appointmentDate,
      appointStatus: row.appointStatus,
      plate: extra.plate || '',
      province: extra.province || '',
      startTime: extra.startTime || '',
      endTime: extra.endTime || '',
    };
  });
}
