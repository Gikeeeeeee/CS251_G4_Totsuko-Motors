import { findServiceRequests } from '../../repo/service/dashboard-detail.repo';

export async function getServiceList(page: number, limit: number, status?: string) {
  const { data, totalItems } = await findServiceRequests(page, limit, status);

  const formattedData = data.map((row) => ({
    requestId: row.serviceRequest.requestId,
    checkingDate: row.serviceRequest.checkingDate,
    requestStatus: row.serviceRequest.requestStatus,
    problemDescription: row.serviceRequest.problemDescription,
    odometer: row.serviceRequest.odometer,
    customerName: row.customer?.name || 'Unknown',
    clerkName: row.employee?.name || 'Unassigned',
    // ข้อมูลสำหรับหัวกระดาษหน้า Service Detail
    vehicleDetail: {
      plateNumber: row.vehicle?.plateNumber || 'N/A',
      model: row.vehicle?.model || 'Unknown',
      brand: row.vehicle?.brand || 'Unknown',
      color: row.vehicle?.color || 'N/A',
      year: row.vehicle?.year || 'N/A',
    }
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
      hasPrevPage: page > 1,
    },
  };
}
