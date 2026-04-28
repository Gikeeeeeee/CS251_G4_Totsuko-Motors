import { Request, Response } from 'express';
import { createAppointment } from '../../services/appointment/appointment.service';

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
