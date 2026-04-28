import { Request, Response } from 'express';
import { createAppointment, getAppointmentsByRequestId } from '../../services/appointment/appointment.service';

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
