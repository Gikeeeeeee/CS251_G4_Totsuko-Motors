import { Request, Response } from 'express';
import {
  createServiceJobForRequest,
  updateServiceJobById,
} from '../../services/service/service-job.service';

export async function createServiceJob(req: Request, res: Response) {
  try {
    const data = await createServiceJobForRequest(req.params.serviceId, req.body);
    res.status(201).json({
      message: 'Service job created successfully',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create service job';
    const statusCode = message.includes('not found') ? 404 : 500;

    res.status(statusCode).json({ error: message });
  }
}

export async function updateServiceJob(req: Request, res: Response) {
  try {
    const data = await updateServiceJobById(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update service job';
    const statusCode = message.includes('field') || message.includes('valid number') ? 400 : 500;

    res.status(statusCode).json({ error: message });
  }
}
