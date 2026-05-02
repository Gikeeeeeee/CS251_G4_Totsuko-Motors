import { Request, Response } from 'express';
import { getServiceList, getServiceRequestById } from '../../services/service/dashboard-detail.service';

export async function getServiceRequestByIdController(req: Request, res: Response) {
  try {
    const data = await getServiceRequestById(req.params.requestId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    const statusCode = message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json({ success: false, message });
  }
}

export async function getServiceRequests(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    const result = await getServiceList(page, limit, status);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
