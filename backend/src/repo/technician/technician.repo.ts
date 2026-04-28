import { db } from '../../db';
import { technician, employee } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const findAvailableTechnicians = async () => {
  return await db
    .select({
      employeeId: technician.employeeId,
      name: employee.name,
      phone: employee.phone,
      specialization: technician.specialization,
      isAvailable: technician.isAvailable,
    })
    .from(technician)
    .innerJoin(employee, eq(technician.employeeId, employee.employeeId))
    .where(eq(technician.isAvailable, true));
};

export const findAllTechnicians = async () => {
  return await db
    .select({
      employeeId: technician.employeeId,
      name: employee.name,
      phone: employee.phone,
      specialization: technician.specialization,
      isAvailable: technician.isAvailable,
    })
    .from(technician)
    .innerJoin(employee, eq(technician.employeeId, employee.employeeId));
};

export const findTechnicianById = async (employeeId: string) => {
  const result = await db
    .select({
      employeeId: technician.employeeId,
      name: employee.name,
      phone: employee.phone,
      specialization: technician.specialization,
      isAvailable: technician.isAvailable,
    })
    .from(technician)
    .innerJoin(employee, eq(technician.employeeId, employee.employeeId))
    .where(eq(technician.employeeId, employeeId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
};
