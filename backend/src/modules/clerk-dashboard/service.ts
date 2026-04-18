// clerk-dashboard.service.ts
import { ClerkDashboardRepository } from './repo';

export class ClerkDashboardService {
  private repo = new ClerkDashboardRepository();

  async getServiceList(page: number, limit: number, status?: string) {
    const { data, totalItems } = await this.repo.findServiceRequests(page, limit, status);

    // 💡 หน้าที่ Service: แปลง Raw Row จาก DB ให้เป็น Clean Object
    const formattedData = data.map((row) => ({
      // เปลี่ยนจาก row.servicerequest เป็น row.serviceRequest (ตามชื่อตัวแปรที่ export ใน schema)
      requestId: row.serviceRequest.requestId, 
      checkingDate: row.serviceRequest.checkingDate,
      requestStatus: row.serviceRequest.requestStatus,
      problemDescription: row.serviceRequest.problemDescription,
      odometer: row.serviceRequest.odometer,
      
      // ใช้เครื่องหมาย ? เพราะเป็นผลจาก Left Join (ข้อมูลอาจเป็น null ได้)
      customerName: row.customer?.name || 'Unknown',
      plateNumber: row.vehicle?.plateNumber || 'N/A',
      clerkName: row.employee?.name || 'Unassigned',
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      data: formattedData,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
}