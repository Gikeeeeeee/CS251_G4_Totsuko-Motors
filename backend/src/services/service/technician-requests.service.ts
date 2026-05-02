import { findTechnicianRequests } from '../../repo/service/technician-requests.repo';

export async function getTechnicianRequestList(page: number, limit: number, status?: string) {
  const { data, totalItems } = await findTechnicianRequests(page, limit, status);

  const formattedData = data.map((row) => ({
    requestId: row.serviceRequest.requestId,
    checkingDate: row.serviceRequest.checkingDate,
    requestStatus: row.serviceRequest.requestStatus,
    problemDescription: row.serviceRequest.problemDescription,
    odometer: row.serviceRequest.odometer,
    customerName: row.customer?.name || 'Unknown',
    plateNumber: row.vehicle?.plateNumber || 'N/A',
    clerkName: row.employee?.name || 'Unassigned',
    model: row.vehicle?.model || null,   // เพิ่ม
    color: row.vehicle?.color || null,   // เพิ่ม 
    year: row.vehicle?.year || null,     // เพิ่ม
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
