import { Request, Response } from 'express';
import { createPartUsage } from '../../services/service/part-usage.service';

export async function createUsePart(req: Request, res: Response) {
  try {
    const data = await createPartUsage({
      ...req.body,
      job_id: req.params.id ?? req.body.job_id,
    });
    res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create part usage';
    const statusCode = message.includes('required') || message.includes('valid number') ? 400 : 500;

    res.status(statusCode).json({ error: message });
  }
}
