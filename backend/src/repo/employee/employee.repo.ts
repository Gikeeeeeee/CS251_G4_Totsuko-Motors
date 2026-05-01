import { db } from '../../db';
import { employee, userAccount } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const findAllEmployees = async () => {
  return await db
    .select({
      employeeId: employee.employeeId,
      name: employee.name,
      phone: employee.phone,
      hireDate: employee.hireDate,
      userId: employee.userId,
      email: userAccount.email,
      username: userAccount.username,
      role: userAccount.role,
      status: userAccount.status,
    })
    .from(employee)
    .leftJoin(userAccount, eq(employee.userId, userAccount.userId));
};

export const findEmployeeById = async (employeeId: string) => {
  const result = await db
    .select({
      employeeId: employee.employeeId,
      name: employee.name,
      phone: employee.phone,
      hireDate: employee.hireDate,
      userId: employee.userId,
      email: userAccount.email,
      username: userAccount.username,
      role: userAccount.role,
      status: userAccount.status,
    })
    .from(employee)
    .leftJoin(userAccount, eq(employee.userId, userAccount.userId))
    .where(eq(employee.employeeId, employeeId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
};
