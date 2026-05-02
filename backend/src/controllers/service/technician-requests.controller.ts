import { Request, Response } from 'express';
import { getTechnicianRequestList } from '../../services/service/technician-requests.service';


export async function getTechnicianRequests(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as string | undefined;

    const result = await getTechnicianRequestList(page, limit, status);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Technician Requests Controller Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
}
