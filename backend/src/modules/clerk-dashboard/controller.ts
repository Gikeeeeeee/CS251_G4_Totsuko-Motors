// clerk-dashboard.controller.ts
import { Request, Response } from 'express';
import { ClerkDashboardService } from './service';

export class ClerkDashboardController {
  private service = new ClerkDashboardService();

  getServiceRequests = async (req: Request, res: Response) => {
    try {
      // ดึงและเตรียมข้อมูลจาก Query Params
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string; 

      const result = await this.service.getServiceList(page, limit, status);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("Dashboard Controller Error:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Internal Server Error" 
      });
    }
  };
}