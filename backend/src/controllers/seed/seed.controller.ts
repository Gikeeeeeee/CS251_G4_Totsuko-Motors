import { Request, Response } from 'express';
import { db } from '../../db';
import * as schema from '../../db/schema';
import { sql } from 'drizzle-orm';
import { hashPassword } from '../../utils/password';

export async function seedDatabase(req: Request, res: Response) {
  try {
    await db.execute(sql`TRUNCATE TABLE
      "AssignTo", "UsePart", "ServiceJob",
      "InvoiceDetail", "Invoice", "Appointment",
      "ServiceRequest", "Vehicle",
      "PurchaseOrderPart", "PurchaseOrder",
      "Technician", "PurchasingStaff", "Clerk",
      "Employee", "UserAccount",
      "Customer", "Part", "Supplier"
      RESTART IDENTITY CASCADE`);

    // 1. UserAccount
    const [pw1, pw2, pw3, pw4, pw5, pw6, pw7] = await Promise.all([
      hashPassword('Admin1234!'),
      hashPassword('Clerk1234!'),
      hashPassword('Clerk1234!'),
      hashPassword('Tech1234!'),
      hashPassword('Tech1234!'),
      hashPassword('Tech1234!'),
      hashPassword('Purchase1234!'),
    ]);

    await db.insert(schema.userAccount).values([
      { userId: 'U001', email: 'admin@totsuko.com',    username: 'admin',     password: pw1, role: 'Admin',      status: 'Active' },
      { userId: 'U002', email: 'clerk1@totsuko.com',   username: 'clerk_som', password: pw2, role: 'Clerk',      status: 'Active' },
      { userId: 'U003', email: 'clerk2@totsuko.com',   username: 'clerk_nid', password: pw3, role: 'Clerk',      status: 'Active' },
      { userId: 'U004', email: 'tech1@totsuko.com',    username: 'tech_earn', password: pw4, role: 'Technician', status: 'Active' },
      { userId: 'U005', email: 'tech2@totsuko.com',    username: 'tech_poom', password: pw5, role: 'Technician', status: 'Active' },
      { userId: 'U006', email: 'tech3@totsuko.com',    username: 'tech_kai',  password: pw6, role: 'Technician', status: 'Active' },
      { userId: 'U007', email: 'purchase@totsuko.com', username: 'pur_noon',  password: pw7, role: 'Purchasing', status: 'Active' },
    ]);

    // 2. Employee
    await db.insert(schema.employee).values([
      { employeeId: 'E001', name: 'สมชาย ดีมาก',    phone: '081-111-1001', hireDate: '2020-03-01', userId: 'U002' },
      { employeeId: 'E002', name: 'นิดา แสนดี',     phone: '081-111-1002', hireDate: '2021-06-15', userId: 'U003' },
      { employeeId: 'E003', name: 'เอิร์น มือทอง',  phone: '081-111-1003', hireDate: '2019-01-10', userId: 'U004' },
      { employeeId: 'E004', name: 'ภูมิ ช่างเก่ง',  phone: '081-111-1004', hireDate: '2020-07-20', userId: 'U005' },
      { employeeId: 'E005', name: 'ไก่ ซ่อมดี',    phone: '081-111-1005', hireDate: '2022-02-01', userId: 'U006' },
      { employeeId: 'E006', name: 'หนูน จัดซื้อ',   phone: '081-111-1006', hireDate: '2021-09-05', userId: 'U007' },
    ]);

    // 3. Clerk / Technician / PurchasingStaff
    await db.insert(schema.clerk).values([
      { employeeId: 'E001' },
      { employeeId: 'E002' },
    ]);

    await db.insert(schema.technician).values([
      { employeeId: 'E003', specialization: 'เครื่องยนต์',    isAvailable: true  },
      { employeeId: 'E004', specialization: 'ระบบไฟฟ้า',      isAvailable: true  },
      { employeeId: 'E005', specialization: 'ช่วงล่างและยาง', isAvailable: false },
    ]);

    await db.insert(schema.purchasingStaff).values([
      { employeeId: 'E006' },
    ]);

    // 4. Customer
    await db.insert(schema.customer).values([
      { customerId: 'C001', name: 'วิชัย รักรถ',      phone: '089-200-0001', email: 'wichai@mail.com',  address: '12 ถนนพระราม 4 กรุงเทพฯ' },
      { customerId: 'C002', name: 'มาลี สุขใจ',       phone: '089-200-0002', email: 'malee@mail.com',   address: '88 ซอยลาดพร้าว 10 กรุงเทพฯ' },
      { customerId: 'C003', name: 'ธนา พงษ์ดี',       phone: '089-200-0003', email: 'thana@mail.com',   address: '5 ถนนรัชดา กรุงเทพฯ' },
      { customerId: 'C004', name: 'กานดา ใจดี',       phone: '089-200-0004', email: 'kanda@mail.com',   address: '99/1 ถนนสุขุมวิท กรุงเทพฯ' },
      { customerId: 'C005', name: 'ประสิทธิ์ มั่งมี', phone: '089-200-0005', email: 'prasit@mail.com',  address: '7 ถนนวิภาวดี กรุงเทพฯ' },
    ]);

    // 5. Vehicle
    await db.insert(schema.vehicle).values([
      { vehicleId: 'V001', vehicleType: 'Sedan',   color: 'ขาว',     year: 2019, brand: 'Toyota', model: 'Camry',  plateNumber: 'กข-1234', customerId: 'C001' },
      { vehicleId: 'V002', vehicleType: 'SUV',     color: 'ดำ',      year: 2021, brand: 'Honda',  model: 'CR-V',   plateNumber: 'ขค-5678', customerId: 'C001' },
      { vehicleId: 'V003', vehicleType: 'Pickup',  color: 'เงิน',    year: 2018, brand: 'Ford',   model: 'Ranger', plateNumber: 'คง-9012', customerId: 'C002' },
      { vehicleId: 'V004', vehicleType: 'Sedan',   color: 'น้ำเงิน', year: 2020, brand: 'Mazda',  model: 'Mazda3', plateNumber: 'งจ-3456', customerId: 'C003' },
      { vehicleId: 'V005', vehicleType: 'SUV',     color: 'แดง',     year: 2022, brand: 'Isuzu',  model: 'MU-X',   plateNumber: 'จฉ-7890', customerId: 'C004' },
      { vehicleId: 'V006', vehicleType: 'Sedan',   color: 'ขาว',     year: 2017, brand: 'Toyota', model: 'Yaris',  plateNumber: 'ฉช-2345', customerId: 'C005' },
    ]);

    // 6. Supplier
    await db.insert(schema.supplier).values([
      { supplierId: 'SUP001', supplierName: 'Thai Auto Parts Co., Ltd.', phone: '02-300-1001', email: 'sales@thaiparts.co.th', address: '100 ถนนบางนา กรุงเทพฯ' },
      { supplierId: 'SUP002', supplierName: 'Genuine Spare Bangkok',     phone: '02-300-1002', email: 'order@genuinebkk.com',  address: '55 ถนนพหลโยธิน กรุงเทพฯ' },
      { supplierId: 'SUP003', supplierName: 'Pro Filter Thailand',       phone: '02-300-1003', email: 'info@profilter.th',     address: '7 ถนนรามคำแหง กรุงเทพฯ' },
    ]);

    // 7. Part
    await db.insert(schema.part).values([
      { partId: 'P001', partName: 'น้ำมันเครื่อง 5W-30 (1L)',  stockQuantity: 50, price: '250.00',  reorderPoint: 20, reservedQty: 5 },
      { partId: 'P002', partName: 'ไส้กรองน้ำมันเครื่อง',      stockQuantity: 30, price: '180.00',  reorderPoint: 10, reservedQty: 2 },
      { partId: 'P003', partName: 'ผ้าเบรกหน้า (คู่)',          stockQuantity: 15, price: '950.00',  reorderPoint: 5,  reservedQty: 1 },
      { partId: 'P004', partName: 'น้ำยาแอร์ R134a (500g)',     stockQuantity: 20, price: '320.00',  reorderPoint: 8,  reservedQty: 0 },
      { partId: 'P005', partName: 'กรองแอร์',                   stockQuantity: 25, price: '420.00',  reorderPoint: 8,  reservedQty: 2 },
      { partId: 'P006', partName: 'ยาง Bridgestone 195/65R15', stockQuantity: 16, price: '2800.00', reorderPoint: 4,  reservedQty: 4 },
      { partId: 'P007', partName: 'โช้คอัพหน้า Monroe',        stockQuantity: 8,  price: '3500.00', reorderPoint: 2,  reservedQty: 2 },
      { partId: 'P008', partName: 'หัวเทียน NGK (แพ็ค 4)',     stockQuantity: 20, price: '680.00',  reorderPoint: 6,  reservedQty: 0 },
      { partId: 'P009', partName: 'สายพานไทม์มิ่ง',            stockQuantity: 6,  price: '1200.00', reorderPoint: 2,  reservedQty: 0 },
      { partId: 'P010', partName: 'น้ำกลั่นแบตเตอรี่ (1L)',    stockQuantity: 40, price: '35.00',   reorderPoint: 15, reservedQty: 0 },
    ]);

    // 8. Purchase Order
    await db.insert(schema.purchaseOrder).values([
      { poId: 'PO001', orderStatus: 'Received',  orderDate: '2024-09-10', purchasingStaffId: 'E006', supplierId: 'SUP001', orderQuantity: 50 },
      { poId: 'PO002', orderStatus: 'Received',  orderDate: '2024-10-01', purchasingStaffId: 'E006', supplierId: 'SUP002', orderQuantity: 20 },
      { poId: 'PO003', orderStatus: 'Pending',   orderDate: '2024-12-01', purchasingStaffId: 'E006', supplierId: 'SUP003', orderQuantity: 30 },
      { poId: 'PO004', orderStatus: 'Cancelled', orderDate: '2024-11-15', purchasingStaffId: 'E006', supplierId: 'SUP001', orderQuantity: 10 },
    ]);

    await db.insert(schema.purchaseOrderPart).values([
      { poId: 'PO001', partId: 'P001', buyingPrice: '200.00'  },
      { poId: 'PO001', partId: 'P002', buyingPrice: '140.00'  },
      { poId: 'PO002', partId: 'P003', buyingPrice: '750.00'  },
      { poId: 'PO002', partId: 'P006', buyingPrice: '2400.00' },
      { poId: 'PO003', partId: 'P004', buyingPrice: '260.00'  },
      { poId: 'PO003', partId: 'P005', buyingPrice: '340.00'  },
      { poId: 'PO004', partId: 'P007', buyingPrice: '2900.00' },
    ]);

    // 9. Service Request
    await db.insert(schema.serviceRequest).values([
      { requestId: 'SR001', checkingDate: new Date('2024-10-05T09:00:00'), requestStatus: 'Completed',  problemDescription: 'เปลี่ยนถ่ายน้ำมันเครื่อง ครบ 10,000 กม.',   odometer: 52000, customerId: 'C001', vehicleId: 'V001', clerkId: 'E001', technicianId: 'E003' },
      { requestId: 'SR002', checkingDate: new Date('2024-10-12T10:30:00'), requestStatus: 'Completed',  problemDescription: 'เบรกหน้าส่งเสียง กรี๊ดตอนเหยียบ',             odometer: 35000, customerId: 'C002', vehicleId: 'V003', clerkId: 'E001', technicianId: 'E005' },
      { requestId: 'SR003', checkingDate: new Date('2024-11-01T08:00:00'), requestStatus: 'Completed',  problemDescription: 'แอร์ไม่เย็น ลมออกน้อย',                       odometer: 61000, customerId: 'C003', vehicleId: 'V004', clerkId: 'E002', technicianId: 'E004' },
      { requestId: 'SR004', checkingDate: new Date('2024-12-01T09:15:00'), requestStatus: 'In Progress',problemDescription: 'สัญญาณไฟเตือน Check Engine ติดค้าง',           odometer: 78000, customerId: 'C004', vehicleId: 'V005', clerkId: 'E002', technicianId: 'E003' },
      { requestId: 'SR005', checkingDate: new Date('2024-12-03T11:00:00'), requestStatus: 'In Progress',problemDescription: 'ช่วงล่างมีเสียงดังเวลาขับผ่านหลุม',            odometer: 45000, customerId: 'C005', vehicleId: 'V006', clerkId: 'E001', technicianId: 'E005' },
      { requestId: 'SR006', checkingDate: new Date('2024-12-05T13:00:00'), requestStatus: 'Pending',    problemDescription: 'เปลี่ยนยางทั้ง 4 เส้น ดอกยางหมด',               odometer: 88000, customerId: 'C001', vehicleId: 'V002', clerkId: 'E002', technicianId: null   },
    ]);

    // 10. Appointment
    await db.insert(schema.appointment).values([
      { appointmentId: 'AP001', appointmentDate: new Date('2024-10-05T09:00:00'), appointStatus: 'Completed', requestId: 'SR001' },
      { appointmentId: 'AP002', appointmentDate: new Date('2024-10-12T10:00:00'), appointStatus: 'Completed', requestId: 'SR002' },
      { appointmentId: 'AP003', appointmentDate: new Date('2024-11-01T08:00:00'), appointStatus: 'Completed', requestId: 'SR003' },
      { appointmentId: 'AP004', appointmentDate: new Date('2024-12-01T09:00:00'), appointStatus: 'Confirmed', requestId: 'SR004' },
      { appointmentId: 'AP005', appointmentDate: new Date('2024-12-03T11:00:00'), appointStatus: 'Confirmed', requestId: 'SR005' },
      { appointmentId: 'AP006', appointmentDate: new Date('2024-12-10T14:00:00'), appointStatus: 'Pending',   requestId: 'SR006' },
    ]);

    // 11. Service Job
    await db.insert(schema.serviceJob).values([
      { serviceId: 'SJ001', serviceType: 'Maintenance', serviceDetails: 'เปลี่ยนถ่ายน้ำมันเครื่อง + เปลี่ยนไส้กรอง',   startTime: new Date('2024-10-05T09:30:00'), endTime: new Date('2024-10-05T10:30:00'), serviceStatus: 'Completed',  laborCost: '500.00', requestId: 'SR001' },
      { serviceId: 'SJ002', serviceType: 'Repair',      serviceDetails: 'เปลี่ยนผ้าเบรกหน้าทั้ง 2 ข้าง',                startTime: new Date('2024-10-12T10:30:00'), endTime: new Date('2024-10-12T13:00:00'), serviceStatus: 'Completed',  laborCost: '800.00', requestId: 'SR002' },
      { serviceId: 'SJ003', serviceType: 'Repair',      serviceDetails: 'เติมน้ำยาแอร์ R134a และเปลี่ยนกรองแอร์',       startTime: new Date('2024-11-01T08:30:00'), endTime: new Date('2024-11-01T10:00:00'), serviceStatus: 'Completed',  laborCost: '600.00', requestId: 'SR003' },
      { serviceId: 'SJ004', serviceType: 'Diagnosis',   serviceDetails: 'อ่านโค้ด OBD-II พบ P0420 Catalyst Efficiency', startTime: new Date('2024-12-01T09:30:00'), endTime: null,                            serviceStatus: 'In Progress',laborCost: '350.00', requestId: 'SR004' },
      { serviceId: 'SJ005', serviceType: 'Repair',      serviceDetails: 'ตรวจและเปลี่ยนโช้คอัพหน้าซ้าย',               startTime: new Date('2024-12-03T11:30:00'), endTime: null,                            serviceStatus: 'In Progress',laborCost: '700.00', requestId: 'SR005' },
    ]);

    // 12. Use Part
    await db.insert(schema.usePart).values([
      { serviceId: 'SJ001', partId: 'P001', quantity: 4 },
      { serviceId: 'SJ001', partId: 'P002', quantity: 1 },
      { serviceId: 'SJ002', partId: 'P003', quantity: 1 },
      { serviceId: 'SJ003', partId: 'P004', quantity: 1 },
      { serviceId: 'SJ003', partId: 'P005', quantity: 1 },
      { serviceId: 'SJ005', partId: 'P007', quantity: 1 },
    ]);

    // 13. Assign To
    await db.insert(schema.assignTo).values([
      { serviceId: 'SJ001', technicianId: 'E003' },
      { serviceId: 'SJ002', technicianId: 'E005' },
      { serviceId: 'SJ003', technicianId: 'E004' },
      { serviceId: 'SJ004', technicianId: 'E003' },
      { serviceId: 'SJ004', technicianId: 'E004' },
      { serviceId: 'SJ005', technicianId: 'E005' },
    ]);

    // 14. Invoice
    await db.insert(schema.invoice).values([
      { invoiceId: 'INV001', createdDate: '2024-10-05', paymentStatus: 'Paid',    totalAmount: '2220.00', requestId: 'SR001' },
      { invoiceId: 'INV002', createdDate: '2024-10-12', paymentStatus: 'Paid',    totalAmount: '2550.00', requestId: 'SR002' },
      { invoiceId: 'INV003', createdDate: '2024-11-01', paymentStatus: 'Paid',    totalAmount: '2060.00', requestId: 'SR003' },
      { invoiceId: 'INV004', createdDate: '2024-12-01', paymentStatus: 'Pending', totalAmount: '350.00',  requestId: 'SR004' },
    ]);

    await db.insert(schema.invoiceDetail).values([
      { invoiceId: 'INV001', details: 'ค่าแรงเปลี่ยนถ่ายน้ำมันเครื่อง', amount: '500.00'  },
      { invoiceId: 'INV001', details: 'น้ำมันเครื่อง 5W-30 x4L',         amount: '1000.00' },
      { invoiceId: 'INV001', details: 'ไส้กรองน้ำมันเครื่อง x1',         amount: '180.00'  },
      { invoiceId: 'INV001', details: 'VAT 7%',                           amount: '118.60'  },
      { invoiceId: 'INV001', details: 'ส่วนลดลูกค้าประจำ',                amount: '-78.60'  },
      { invoiceId: 'INV002', details: 'ค่าแรงเปลี่ยนผ้าเบรก',            amount: '800.00'  },
      { invoiceId: 'INV002', details: 'ผ้าเบรกหน้า x1 คู่',              amount: '950.00'  },
      { invoiceId: 'INV002', details: 'VAT 7%',                           amount: '122.50'  },
      { invoiceId: 'INV002', details: 'ค่าล้างจานเบรก',                  amount: '200.00'  },
      { invoiceId: 'INV003', details: 'ค่าแรงซ่อมแอร์',                  amount: '600.00'  },
      { invoiceId: 'INV003', details: 'น้ำยาแอร์ R134a x1',              amount: '320.00'  },
      { invoiceId: 'INV003', details: 'กรองแอร์ x1',                     amount: '420.00'  },
      { invoiceId: 'INV003', details: 'VAT 7%',                           amount: '94.50'   },
      { invoiceId: 'INV004', details: 'ค่าวินิจฉัย OBD-II',              amount: '350.00'  },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Totsuko Motors database seeded successfully!',
      summary: {
        users: 7, employees: 6, technicians: 3, clerks: 2,
        customers: 5, vehicles: 6,
        parts: 10, suppliers: 3, purchaseOrders: 4,
        serviceRequests: 6, serviceJobs: 5, invoices: 4,
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Seed failed';
    return res.status(500).json({ success: false, message });
  }
}
