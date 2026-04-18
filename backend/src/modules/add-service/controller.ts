import { Request, Response } from 'express';
import { createService } from './service';

export async function createServiceController(req: Request, res: Response) {
  try {
    const data = await createService(req.body);

    res.status(201).json({
      message: 'Service request created successfully',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create service request';
    const statusCode = message.includes('required') || message.includes('valid number') ? 400 : 500;

    res.status(statusCode).json({ message });
  }
}
