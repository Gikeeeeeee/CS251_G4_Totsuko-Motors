import {
  boolean,
  date,
  decimal,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userAccount = pgTable('UserAccount', {
  userId: varchar('user_id', { length: 10 }).primaryKey(),
  email: varchar('email', { length: 100 }).unique().notNull(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }),
  status: varchar('status', { length: 20 }).default('Active'),
});

export const employee = pgTable('Employee', {
  employeeId: varchar('employee_id', { length: 10 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  hireDate: date('hire_date'),
  userId: varchar('user_id', { length: 10 })
    .unique()
    .references(() => userAccount.userId),
});

export const technician = pgTable('Technician', {
  employeeId: varchar('employee_id', { length: 10 })
    .primaryKey()
    .references(() => employee.employeeId),
  specialization: varchar('specialization', { length: 100 }),
  isAvailable: boolean('is_available').default(true),
});

export const purchasingStaff = pgTable('PurchasingStaff', {
  employeeId: varchar('employee_id', { length: 10 })
    .primaryKey()
    .references(() => employee.employeeId),
});

export const clerk = pgTable('Clerk', {
  employeeId: varchar('employee_id', { length: 10 })
    .primaryKey()
    .references(() => employee.employeeId),
});

export const customer = pgTable('Customer', {
  customerId: varchar('customer_id', { length: 10 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  email: varchar('email', { length: 100 }),
});

export const vehicle = pgTable('Vehicle', {
  vehicleId: varchar('vehicle_id', { length: 10 }).primaryKey(),
  vehicleType: varchar('vehicle_type', { length: 30 }),
  color: varchar('color', { length: 30 }),
  year: integer('year'),
  model: varchar('model', { length: 50 }),
  brand: varchar('brand', { length: 50 }),
  plateNumber: varchar('plate_number', { length: 20 }).notNull(),
  customerId: varchar('customer_id', { length: 10 }).references(() => customer.customerId),
});

export const serviceRequest = pgTable('ServiceRequest', {
  requestId: varchar('request_id', { length: 10 }).primaryKey(),
  checkingDate: timestamp('checking_date').defaultNow(),
  requestStatus: varchar('request_status', { length: 30 }).default('Pending'),
  problemDescription: text('problem_description'),
  odometer: integer('odometer'),
  customerId: varchar('customer_id', { length: 10 }).references(() => customer.customerId),
  vehicleId: varchar('vehicle_id', { length: 10 }).references(() => vehicle.vehicleId),
  clerkId: varchar('clerk_id', { length: 10 }).references(() => clerk.employeeId),
  technicianId: varchar('technician_id', { length: 10 }).references(() => technician.employeeId),
});

export const appointment = pgTable('Appointment', {
  appointmentId: varchar('appointment_id', { length: 10 }).primaryKey(),
  appointmentDate: timestamp('appointment_date'),
  appointStatus: varchar('appoint_status', { length: 20 }),
  requestId: varchar('request_id', { length: 10 }).references(() => serviceRequest.requestId),
});

export const invoice = pgTable('Invoice', {
  invoiceId: varchar('invoice_id', { length: 10 }).primaryKey(),
  createdDate: date('created_date').defaultNow(),
  paymentStatus: varchar('payment_status', { length: 30 }),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  requestId: varchar('request_id', { length: 10 })
    .unique()
    .references(() => serviceRequest.requestId),
});

export const invoiceDetail = pgTable(
  'InvoiceDetail',
  {
    invoiceId: varchar('invoice_id', { length: 10 }).references(() => invoice.invoiceId),
    details: text('details').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.invoiceId, table.details] }),
  }),
);

export const supplier = pgTable('Supplier', {
  supplierId: varchar('supplier_id', { length: 10 }).primaryKey(),
  supplierName: varchar('supplier_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  address: text('address'),
});

export const purchaseOrder = pgTable('PurchaseOrder', {
  poId: varchar('po_id', { length: 10 }).primaryKey(),
  orderStatus: varchar('order_status', { length: 30 }),
  orderDate: date('order_date'),
  purchasingStaffId: varchar('purchasing_staff_id', { length: 10 }).references(
    () => purchasingStaff.employeeId,
  ),
  supplierId: varchar('supplier_id', { length: 10 }).references(() => supplier.supplierId),
  orderQuantity: integer('order_quantity'),
});

export const part = pgTable('Part', {
  partId: varchar('part_id', { length: 10 }).primaryKey(),
  partName: varchar('part_name', { length: 100 }).notNull(),
  stockQuantity: integer('stock_quantity').default(0),
  price: decimal('price', { precision: 10, scale: 2 }),
  reorderPoint: integer('reorder_point'),
  reservedQty: integer('reserved_qty').default(0),
});

export const purchaseOrderPart = pgTable(
  'PurchaseOrderPart',
  {
    poId: varchar('po_id', { length: 10 }).references(() => purchaseOrder.poId),
    partId: varchar('part_id', { length: 10 }).references(() => part.partId),
    buyingPrice: decimal('buying_price', { precision: 10, scale: 2 }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.poId, table.partId] }),
  }),
);

export const serviceJob = pgTable('ServiceJob', {
  serviceId: varchar('service_id', { length: 10 }).primaryKey(),
  serviceType: varchar('service_type', { length: 50 }),
  serviceDetails: text('service_details'),
  startTime: timestamp('start_time'),
  endTime: timestamp('end_time'),
  serviceStatus: varchar('service_status', { length: 30 }),
  laborCost: decimal('labor_cost', { precision: 10, scale: 2 }),
  requestId: varchar('request_id', { length: 10 }).references(() => serviceRequest.requestId),
});

export const usePart = pgTable(
  'UsePart',
  {
    serviceId: varchar('service_id', { length: 10 }).references(() => serviceJob.serviceId),
    partId: varchar('part_id', { length: 10 }).references(() => part.partId),
    quantity: integer('quantity'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.serviceId, table.partId] }),
  }),
);

export const assignTo = pgTable(
  'AssignTo',
  {
    serviceId: varchar('service_id', { length: 10 }).references(() => serviceJob.serviceId),
    technicianId: varchar('technician_id', { length: 10 }).references(() => technician.employeeId),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.serviceId, table.technicianId] }),
  }),
);

export const serviceRequestRelations = relations(serviceRequest, ({ one, many }) => ({
  customer: one(customer, {
    fields: [serviceRequest.customerId],
    references: [customer.customerId],
  }),
  vehicle: one(vehicle, {
    fields: [serviceRequest.vehicleId],
    references: [vehicle.vehicleId],
  }),
  clerk: one(clerk, {
    fields: [serviceRequest.clerkId],
    references: [clerk.employeeId],
  }),
  appointments: many(appointment),
  serviceJobs: many(serviceJob),
}));

export const customerRelations = relations(customer, ({ many }) => ({
  vehicles: many(vehicle),
  requests: many(serviceRequest),
}));

export const vehicleRelations = relations(vehicle, ({ one }) => ({
  owner: one(customer, {
    fields: [vehicle.customerId],
    references: [customer.customerId],
  }),
}));
