import { Request, Response } from 'express';
import { createService } from '../../services/service/service-request.service';
import { updateServiceRequestStatus } from '../../repo/service/service-request.repo';

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

const ALLOWED_STATUSES = ['Pending', 'In Progress', 'Complete'];

export async function updateServiceRequestStatusController(req: Request, res: Response) {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const updated = await updateServiceRequestStatus(requestId, status);
    if (!updated) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update status';
    res.status(500).json({ message });
  }
}
