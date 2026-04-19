import { Request, Response } from 'express';
import { getPurchasingParts } from '../../services/parts/purchasing-parts.service';

export async function getPurchasingPartsController(req: Request, res: Response) {
  try {
    const data = await getPurchasingParts(req.query.status);

    res.json({
      message: 'Purchasing parts fetched successfully',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch purchasing parts';
    const statusCode = message.includes('status must be') ? 400 : 500;

    res.status(statusCode).json({ message });
  }
}
