import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import { customer, employee, serviceRequest, vehicle } from '../../db/schema';

export async function findTechnicianRequests(page: number, limit: number, status?: string) {
  const offset = (page - 1) * limit;
  const filter = status ? eq(serviceRequest.requestStatus, status) : undefined;

  const data = await db
    .select({
      serviceRequest,
      customer,
      vehicle,
      employee,
    })
    .from(serviceRequest)
    .leftJoin(customer, eq(serviceRequest.customerId, customer.customerId))
    .leftJoin(vehicle, eq(serviceRequest.vehicleId, vehicle.vehicleId))
    .leftJoin(employee, eq(serviceRequest.clerkId, employee.employeeId))
    .where(filter)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(serviceRequest.checkingDate));

  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceRequest)
    .where(filter);

  return { data, totalItems: Number(totalResult[0]?.count || 0) };
}
