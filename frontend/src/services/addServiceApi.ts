import apiClient from './apiClient';

export type CreateServiceRequest = {
  name: string;
  phone: string;
  email: string;
  plate_number: string;
  brand: string;
  model: string;
  year: number;
  vehicle_type: string;
  color: string;
  odometer: number;
  problem_description: string;
};

export type CreateServiceResponse = {
  message: string;
  data: {
    customer: {
      customerId: string;
      name: string;
      phone: string;
      address?: string;
      email: string;
    };
    vehicle: {
      vehicleId: string;
      vehicleType: string;
      color: string;
      year: number;
      model: string;
      brand: string;
      plateNumber: string;
      customerId: string;
    };
    serviceRequest: {
      requestId: string;
      checkingDate: string;
      requestStatus: string;
      problemDescription: string;
      odometer: number;
      customerId: string;
      vehicleId: string;
      clerkId: string | null;
      technicianId: string | null;
    };
  };
};

export async function createService(data: CreateServiceRequest): Promise<CreateServiceResponse> {
  const response = await apiClient.post<CreateServiceResponse>('/api/service/service-request/create', data);
  return response.data;
}
