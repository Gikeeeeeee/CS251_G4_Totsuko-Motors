BEGIN;

-- 1. สร้าง UserAccount สำหรับพนักงานทั้งหมด (ช่าง 5 คน + เสมียน 1 คน)
-- userId มี length=10 จึงตั้งชื่อให้พอดี
INSERT INTO "UserAccount" (user_id, name, email, username, password, role, status) VALUES
('U-67096167', 'พีรภัทร เอกดิษฐ์', 'tech1@shop.com', 'tech1', 'hashed_pw', 'Technician', 'Active'),
('U-67012345', 'ธีธัช ปูอัด', 'tech2@shop.com', 'tech2', 'hashed_pw', 'Technician', 'Active'),
('U-67089012', 'บริวัฒน์ สงนุ้ย', 'tech3@shop.com', 'tech3', 'hashed_pw', 'Technician', 'Active'),
('U-67056789', 'ธัชกฤต สตารัตน์', 'tech4@shop.com', 'tech4', 'hashed_pw', 'Technician', 'Active'),
('U-67023456', 'ภาณุพงศ์ สุขติเกษม', 'tech5@shop.com', 'tech5', 'hashed_pw', 'Technician', 'Active'),
('U-CLERK001', 'สมหญิง รับเรื่อง', 'clerk@shop.com', 'clerk1', 'hashed_pw', 'Clerk', 'Active');

-- 2. สร้าง Employee โดยอ้างอิง user_id (employee_id ของช่างใช้ตามที่คุณระบุ)
INSERT INTO "Employee" (employee_id, name, phone, hire_date, user_id) VALUES
('6709616764', 'พีรภัทร เอกดิษฐ์', '0811111111', '2024-01-01', 'U-67096167'),
('6701234567', 'ธีธัช ปูอัด', '0822222222', '2024-01-01', 'U-67012345'),
('6708901234', 'บริวัฒน์ สงนุ้ย', '0833333333', '2024-01-01', 'U-67089012'),
('6705678901', 'ธัชกฤต สตารัตน์', '0844444444', '2024-01-01', 'U-67056789'),
('6702345678', 'ภาณุพงศ์ สุขติเกษม', '0855555555', '2024-01-01', 'U-67023456'),
('C-001', 'สมหญิง รับเรื่อง', '0899999999', '2024-01-01', 'U-CLERK001');

<<<<<<< HEAD
-- 3. แยกประเภทพนักงานลงตาราง Clerk และ Technician
INSERT INTO "Clerk" (employee_id) VALUES ('C-001');
=======
-- 2. ลูกค้าและรถยนต์
CREATE TABLE IF NOT EXISTS "Customer" (
    "customer_id" VARCHAR(10) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "email" VARCHAR(100)
);
>>>>>>> ee4cb16d0332328b098140b08b135159a09413bf

INSERT INTO "Technician" (employee_id, specialization, is_available) VALUES
('6709616764', 'ช่างซ่อมเครื่องยนต์', true),
('6701234567', 'ช่างไฟฟ้ารถยนต์', true),
('6708901234', 'ช่างระบบเบรกและช่วงล่าง', true),
('6705678901', 'ช่างเคาะพ่นสี', true),
('6702345678', 'ช่างระบบเกียร์', true);

-- 4. สร้างข้อมูลลูกค้า (Customer)
INSERT INTO "Customer" (customer_id, name, phone, address, email) VALUES
('CUST-001', 'สมชาย ใจดี', '0801234567', '123 ถ.สุขุมวิท กทม.', 'somchai@example.com');

-- 5. สร้างข้อมูลรถยนต์ (Vehicle) ผูกกับลูกค้า
INSERT INTO "Vehicle" (vehicle_id, vehicle_type, color, year, model, brand, plate_number, customer_id) VALUES
('V-001', 'Sedan', 'White', 2020, 'Civic', 'Honda', 'กข 1234', 'CUST-001');

-- 6. สร้างใบแจ้งซ่อม (Service Request) รถ 1 คัน แจ้ง 1 ครั้ง
-- ให้ 'พีรภัทร' (ช่างเครื่อง) เป็นหัวหน้างานหลักใน request นี้
INSERT INTO "ServiceRequest" (request_id, checking_date, request_status, problem_description, odometer, customer_id, vehicle_id, clerk_id, technician_id) VALUES
('REQ-001', CURRENT_TIMESTAMP, 'In Progress', 'เครื่องยนต์มีเสียงดังผิดปกติและแอร์ไม่เย็น', 55000, 'CUST-001', 'V-001', 'C-001', '6709616764');

<<<<<<< HEAD
-- 7. สร้างใบนัดหมาย (Appointment) สำหรับ Request นี้
INSERT INTO "Appointment" (appointment_id, appointment_date, appoint_status, notes, request_id) VALUES
('APP-001', '2026-05-02 10:00:00', 'Confirmed', 'ลูกค้านำรถเข้ามาเช็คตามนัดหมาย', 'REQ-001');

-- 8. สร้างรายการงานซ่อมย่อย (Service Job)
INSERT INTO "ServiceJob" (service_id, service_type, service_details, start_time, end_time, service_status, labor_cost, request_id) VALUES
('JOB-001', 'Engine Repair', 'ตรวจสอบและเปลี่ยนสายพานหน้าเครื่อง', CURRENT_TIMESTAMP, NULL, 'In Progress', 500.00, 'REQ-001');

-- 9. มอบหมายช่างให้กับงานซ่อม (AssignTo) 
-- ให้ พีรภัทร (เครื่องยนต์) และ ธีธัช (ไฟฟ้า) ช่วยกันซ่อม
INSERT INTO "AssignTo" (service_id, technician_id) VALUES
('JOB-001', '6709616764'),
('JOB-001', '6701234567');

-- 10. สร้างข้อมูลอะไหล่ (Part) ในระบบ
INSERT INTO "Part" (part_id, part_name, stock_quantity, price, reorder_point, reserved_qty) VALUES
('P-001', 'สายพานหน้าเครื่อง Honda', 10, 850.00, 5, 1),
('P-002', 'น้ำยาแอร์ R134a', 20, 300.00, 10, 2);
=======
-- 4. อะไหล่และการสั่งซื้อ
CREATE TABLE IF NOT EXISTS "Part" (
    "part_id" VARCHAR(10) PRIMARY KEY,
    "part_name" VARCHAR(100) NOT NULL,
    "stock_quantity" INT DEFAULT 0,
    "price" DECIMAL(10,2),
    "reorder_point" INT,
    "reserved_qty" INT DEFAULT 0
);
>>>>>>> ee4cb16d0332328b098140b08b135159a09413bf

-- 11. เบิกอะไหล่มาใช้ในงานซ่อม (UsePart)
INSERT INTO "UsePart" (service_id, part_id, quantity) VALUES
('JOB-001', 'P-001', 1),
('JOB-001', 'P-002', 2);

-- 12. ออกใบแจ้งหนี้ (Invoice) รวมยอดคร่าวๆ (ค่าแรง 500 + ค่าอะไหล่ 1450 = 1950)
INSERT INTO "Invoice" (invoice_id, created_date, payment_status, total_amount, request_id) VALUES
('INV-001', CURRENT_DATE, 'Unpaid', 1950.00, 'REQ-001');

<<<<<<< HEAD
-- 13. ใส่รายละเอียดในใบแจ้งหนี้ (InvoiceDetail)
INSERT INTO "InvoiceDetail" (invoice_id, details, amount) VALUES
('INV-001', 'ค่าแรงตรวจเช็คและซ่อมเครื่องยนต์', 500.00),
('INV-001', 'ค่าสายพานหน้าเครื่อง Honda', 850.00),
('INV-001', 'ค่าน้ำยาแอร์ R134a (2 หน่วย)', 600.00);

COMMIT;
=======
CREATE TABLE IF NOT EXISTS "PurchaseOrderPart" (
    "po_id" VARCHAR(20) REFERENCES "PurchaseOrder"("po_id"),
    "part_id" VARCHAR(10) REFERENCES "Part"("part_id"),
    "buying_price" DECIMAL(10,2),
    "quantity" INT,
    PRIMARY KEY ("po_id", "part_id")
);

CREATE TABLE IF NOT EXISTS "UsePart" (
    "service_id" VARCHAR(10) REFERENCES "ServiceJob"("service_id"),
    "part_id" VARCHAR(10) REFERENCES "Part"("part_id"),
    "quantity" INT,
    PRIMARY KEY ("service_id", "part_id")
);

CREATE TABLE IF NOT EXISTS "AssignTo" (
    "service_id" VARCHAR(10) REFERENCES "ServiceJob"("service_id"),
    "technician_id" VARCHAR(10) REFERENCES "Technician"("employee_id"),
    PRIMARY KEY ("service_id", "technician_id")
);
CREATE TABLE IF NOT EXISTS "Invoice" (
    "invoice_id" VARCHAR(10) PRIMARY KEY,
    "created_date" DATE DEFAULT CURRENT_DATE,
    "payment_status" VARCHAR(30),
    "total_amount" DECIMAL(10, 2),
    "request_id" VARCHAR(10) UNIQUE REFERENCES "ServiceRequest"("request_id")
);

CREATE TABLE IF NOT EXISTS "InvoiceDetail" (
    "invoice_id" VARCHAR(10) REFERENCES "Invoice"("invoice_id"),
    "details" TEXT NOT NULL,
    "amount" DECIMAL(10, 2),
    PRIMARY KEY ("invoice_id", "details")
);
>>>>>>> ee4cb16d0332328b098140b08b135159a09413bf
