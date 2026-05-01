-- สร้างตารางเรียงตามลำดับความสัมพันธ์ (Foreign Key)
-- 1. บัญชีผู้ใช้และพนักงาน
CREATE TABLE IF NOT EXISTS "UserAccount" (
    "user_id" VARCHAR(10) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) UNIQUE NOT NULL,
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS "Employee" (
    "employee_id" VARCHAR(10) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "hire_date" DATE,
    "user_id" VARCHAR(10) UNIQUE REFERENCES "UserAccount"("user_id")
);

-- ตารางย่อยพนักงาน
CREATE TABLE IF NOT EXISTS "Clerk" ("employee_id" VARCHAR(10) PRIMARY KEY REFERENCES "Employee"("employee_id"));
CREATE TABLE IF NOT EXISTS "PurchasingStaff" ("employee_id" VARCHAR(10) PRIMARY KEY REFERENCES "Employee"("employee_id"));
CREATE TABLE IF NOT EXISTS "Technician" (
    "employee_id" VARCHAR(10) PRIMARY KEY REFERENCES "Employee"("employee_id"),
    "specialization" VARCHAR(100),
    "is_available" BOOLEAN DEFAULT TRUE
);

-- 2. ลูกค้าและรถยนต์
CREATE TABLE IF NOT EXISTS "Customer" (
    "customer_id" VARCHAR(10) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "email" VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS "Vehicle" (
    "vehicle_id" VARCHAR(10) PRIMARY KEY,
    "plate_number" VARCHAR(20) NOT NULL,
    "vehicle_type" VARCHAR(30),
    "color" VARCHAR(30),
    "brand" VARCHAR(50),
    "model" VARCHAR(50),
    "year" INTEGER,
    "customer_id" VARCHAR(10) REFERENCES "Customer"("customer_id")
);

-- 3. งานซ่อมและนัดหมาย
CREATE TABLE IF NOT EXISTS "ServiceRequest" (
    "request_id" VARCHAR(10) PRIMARY KEY,
    "checking_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "odometer" INT,
    "problem_description" TEXT,
    "request_status" VARCHAR(30) DEFAULT 'Pending',
    "customer_id" VARCHAR(10) REFERENCES "Customer"("customer_id"),
    "clerk_id" VARCHAR(10) REFERENCES "Employee"("employee_id"),
    "technician_id" VARCHAR(10) REFERENCES "Employee"("employee_id"),
    "vehicle_id" VARCHAR(10) REFERENCES "Vehicle"("vehicle_id")
);

CREATE TABLE IF NOT EXISTS "Appointment" (
    "appointment_id" VARCHAR(10) PRIMARY KEY,
    "appointment_date" TIMESTAMP,
    "appoint_status" VARCHAR(20),
    "notes" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "request_id" VARCHAR(10) REFERENCES "ServiceRequest"("request_id")
);

CREATE TABLE IF NOT EXISTS "ServiceJob" (
    "service_id" VARCHAR(10) PRIMARY KEY,
    "service_type" VARCHAR(50),
    "service_details" TEXT,
    "start_time" TIMESTAMP,
    "end_time" TIMESTAMP,
    "service_status" VARCHAR(30),
    "labor_cost" DECIMAL(10,2),
    "request_id" VARCHAR(10) REFERENCES "ServiceRequest"("request_id")
);

-- 4. อะไหล่และการสั่งซื้อ
CREATE TABLE IF NOT EXISTS "Supplier" (
    "supplier_id" VARCHAR(10) PRIMARY KEY,
    "supplier_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "address" TEXT
);

CREATE TABLE IF NOT EXISTS "Part" (
    "part_id" VARCHAR(10) PRIMARY KEY,
    "part_name" VARCHAR(100) NOT NULL,
    "stock_quantity" INT DEFAULT 0,
    "price" DECIMAL(10,2),
    "reorder_point" INT,
    "reserved_qty" INT DEFAULT 0,
    "supplier_id" VARCHAR(10) REFERENCES "Supplier"("supplier_id")
);

CREATE TABLE IF NOT EXISTS "PurchaseOrder" (
    "po_id" VARCHAR(20) PRIMARY KEY,
    "order_status" VARCHAR(30),
    "order_date" DATE,
    "purchasing_staff_id" VARCHAR(10) REFERENCES "PurchasingStaff"("employee_id"),
    "supplier_id" VARCHAR(10) REFERENCES "Supplier"("supplier_id"),
    "order_quantity" INT
);

CREATE TABLE IF NOT EXISTS "PurchaseOrderPart" (
    "po_id" VARCHAR(20) REFERENCES "PurchaseOrder"("po_id"),
    "part_id" VARCHAR(10) REFERENCES "Part"("part_id"),
    "buying_price" DECIMAL(10,2),
    "quantity" INT NOT NULL,
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
