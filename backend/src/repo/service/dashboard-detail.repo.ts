import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../../db';
import { customer, employee, serviceRequest, vehicle } from '../../db/schema';

export async function findServiceRequestWithDetails(requestId: string) {
  const result = await db
    .select({
      requestId: serviceRequest.requestId,
      requestStatus: serviceRequest.requestStatus,
      problemDescription: serviceRequest.problemDescription,
      odometer: serviceRequest.odometer,
      checkingDate: serviceRequest.checkingDate,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      plateNumber: vehicle.plateNumber,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      vehicleType: vehicle.vehicleType,
    })
    .from(serviceRequest)
    .leftJoin(customer, eq(serviceRequest.customerId, customer.customerId))
    .leftJoin(vehicle, eq(serviceRequest.vehicleId, vehicle.vehicleId))
    .where(eq(serviceRequest.requestId, requestId))
    .limit(1);

  return result[0] ?? null;
}

export async function findServiceRequests(page: number, limit: number, status?: string) {
  const offset = (page - 1) * limit;
  const filter = status ? eq(serviceRequest.requestStatus, status) : undefined;

  const data = await db
    .select({
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

  return { 
    data, 
    totalItems: Number(totalResult[0]?.count || 0) 
  };
}
