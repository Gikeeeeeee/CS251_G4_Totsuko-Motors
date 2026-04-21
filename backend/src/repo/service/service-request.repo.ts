import { db } from '../../db';
import { customer, serviceRequest, vehicle } from '../../db/schema';

export type CreateServiceRecord = {
  customerId: string;
  vehicleId: string;
  requestId: string;
  vehicleType?: string;
  color?: string;
  year?: number;
  model?: string;
  brand?: string;
  plateNumber: string;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  requestStatus?: string;
  problemDescription?: string;
  odometer?: number;
  checkingDate: Date;
};

export async function createServiceRecord(data: CreateServiceRecord) {
  return db.transaction(async (tx) => {
    const [createdCustomer] = await tx
      .insert(customer)
      .values({
        customerId: data.customerId,
        name: data.name,
        phone: data.phone,
        address: data.address,
        email: data.email,
      })
      .returning();

    const [createdVehicle] = await tx
      .insert(vehicle)
      .values({
        vehicleId: data.vehicleId,
        vehicleType: data.vehicleType,
        color: data.color,
        year: data.year,
        model: data.model,
        brand: data.brand,
        plateNumber: data.plateNumber,
        customerId: data.customerId,
      })
      .returning();

    const [createdServiceRequest] = await tx
      .insert(serviceRequest)
      .values({
        requestId: data.requestId,
        checkingDate: data.checkingDate,
        requestStatus: data.requestStatus,
        problemDescription: data.problemDescription,
        odometer: data.odometer,
        customerId: data.customerId,
        vehicleId: data.vehicleId,
      })
      .returning();

    return {
      customer: createdCustomer,
      vehicle: createdVehicle,
      serviceRequest: createdServiceRequest,
    };
  });
}
