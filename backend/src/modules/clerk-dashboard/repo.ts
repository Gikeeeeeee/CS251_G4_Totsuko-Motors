// clerk-dashboard.repo.ts
import { db } from '../../db';
import { serviceRequest, customer, vehicle, employee } from '../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export class ClerkDashboardRepository {
  async findServiceRequests(page: number, limit: number, status?: string) {
    const offset = (page - 1) * limit;
    const filter = status ? eq(serviceRequest.requestStatus, status) : undefined;

    const data = await db
      .select({
        // กำหนดชื่อ Key ที่เราต้องการใช้ใน service.ts ตรงนี้เลย
        serviceRequest: serviceRequest, 
        customer: customer,
        vehicle: vehicle,
        employee: employee
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
}