import {
  findAllEmployees,
  findEmployeeById,
} from '../../repo/employee/employee.repo';

export const getAllEmployees = async () => {
  return await findAllEmployees();
};

export const getEmployeeById = async (employeeId: string) => {
  const employee = await findEmployeeById(employeeId);
  
  if (!employee) {
    throw new Error('ไม่พบพนักงาน');
  }

  return employee;
};
