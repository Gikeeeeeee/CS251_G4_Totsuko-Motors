import { Request, Response } from 'express';
import {
  createServiceJobForRequest,
  getServiceJobById,
  updateServiceJobById,
  getServiceJobsByRequest,
  assignTechnician,
  removeTechnician,
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

export async function getServiceJob(req: Request, res: Response) {
  try {
    const data = await getServiceJobById(req.params.id);
    res.json({
      message: 'Service job fetched successfully',
      data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch service job';
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

export async function getServiceJobsByRequestId(req: Request, res: Response) {
  try {
    const data = await getServiceJobsByRequest(req.params.requestId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch service jobs';
    res.status(500).json({ success: false, message });
  }
}

export async function assignTechnicianToJob(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({ success: false, message: 'technicianId is required' });
    }

    const data = await assignTechnician(id, technicianId);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to assign technician';
    const statusCode = message.includes('not found') ? 404 : message.includes('already assigned') ? 409 : 500;
    return res.status(statusCode).json({ success: false, message });
  }
}

export async function removeTechnicianFromJob(req: Request, res: Response) {
  try {
    const { id, technicianId } = req.params;
    await removeTechnician(id, technicianId);
    return res.status(200).json({ success: true, message: 'Technician removed from job' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove technician';
    const statusCode = message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ success: false, message });
  }
}
