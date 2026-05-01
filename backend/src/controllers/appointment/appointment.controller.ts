import { Request, Response } from 'express';
import {
  createAppointment,
  getAppointmentsByRequestId,
  updateAppointmentStatus,
  quickCreateAppointmentFromForm,
  getAllActiveAppointmentsForBoard,
} from '../../services/appointment/appointment.service';

export async function createAppointmentController(req: Request, res: Response) {
  try {
    const data = await createAppointment(req.body);

    res.status(201).json({
      message: 'Appointment created successfully',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create appointment';
    const statusCode = message.includes('required') || message.includes('Invalid') || message.includes('past') ? 400 : 500;

    res.status(statusCode).json({ message });
  }
}

export async function getAppointmentsByRequestIdController(req: Request, res: Response) {
  try {
    const { requestId } = req.params;
    const data = await getAppointmentsByRequestId(requestId);

    if (!data || data.length === 0) {
      res.status(404).json({ message: 'No appointments found for this request ID' });
      return;
    }

    res.status(200).json({
      message: 'Appointments retrieved successfully',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve appointments';
    res.status(500).json({ message });
  }
}

export async function updateAppointmentController(req: Request, res: Response) {
  try {
    const { appointmentId } = req.params;
    const data = await updateAppointmentStatus(appointmentId, req.body);

    res.status(200).json({
      message: 'Appointment updated successfully',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update appointment';
    const statusCode =
      message.includes('required') ||
      message.includes('Cannot update') ||
      message.includes('Invalid') ||
      message.includes('past')
        ? 400
        : message.includes('not found')
        ? 404
        : 500;

    res.status(statusCode).json({ message });
  }
}

export async function quickCreateAppointmentController(req: Request, res: Response) {
  try {
    const data = await quickCreateAppointmentFromForm(req.body);
    res.status(201).json({
      message: 'Appointment created successfully',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create appointment';
    const statusCode =
      message.includes('required') || message.includes('past') || message.includes('Invalid')
        ? 400
        : message.includes('ไม่พบ') || message.includes('ยังไม่มี')
        ? 404
        : 500;

    res.status(statusCode).json({ message });
  }
}

export async function getAllAppointmentsController(_req: Request, res: Response) {
  try {
    const data = await getAllActiveAppointmentsForBoard();
    res.status(200).json({
      message: 'Appointments retrieved successfully',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve appointments';
    res.status(500).json({ message });
  }
}
