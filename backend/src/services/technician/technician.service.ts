import {
  findAvailableTechnicians,
  findAllTechnicians,
  findTechnicianById,
} from '../../repo/technician/technician.repo';

export const getAvailableTechnicians = async () => {
  return await findAvailableTechnicians();
};

export const getAllTechnicians = async () => {
  return await findAllTechnicians();
};

export const getTechnicianById = async (employeeId: string) => {
  const technician = await findTechnicianById(employeeId);
  
  if (!technician) {
    throw new Error('ไม่พบช่างเทคนิค');
  }

  return technician;
};
