-- 1. บัญชีผู้ใช้ (UserAccount)
CREATE TABLE IF NOT EXISTS "UserAccount" (
    "user_id" VARCHAR(10) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL, 
    "email" VARCHAR(100) UNIQUE NOT NULL,
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'Active'
);

-- 2. พนักงาน (Employee)
CREATE TABLE IF NOT EXISTS "Employee" (
    "employee_id" VARCHAR(10) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "email" VARCHAR(100),
    "hire_date" DATE,
    "job_role" VARCHAR(30),
    "user_id" VARCHAR(10) UNIQUE REFERENCES "UserAccount"("user_id")
);

-- ตารางย่อยพนักงาน (Role Specific)
CREATE TABLE IF NOT EXISTS "Clerk" ("employee_id" VARCHAR(10) PRIMARY KEY REFERENCES "Employee"("employee_id"));
CREATE TABLE IF NOT EXISTS "PurchasingStaff" ("employee_id" VARCHAR(10) PRIMARY KEY REFERENCES "Employee"("employee_id"));
CREATE TABLE IF NOT EXISTS "Technician" (
    "employee_id" VARCHAR(10) PRIMARY KEY REFERENCES "Employee"("employee_id"),
    "specialization" VARCHAR(100),
    "is_available" BOOLEAN DEFAULT TRUE
);

-- 3. ลูกค้าและรถยนต์ (Customer & Vehicle)
CREATE TABLE IF NOT EXISTS "Customer" (
    "customer_id" VARCHAR(10) PRIMARY KEY,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "email" VARCHAR(100),
    "user_id" VARCHAR(10) REFERENCES "UserAccount"("user_id")
);

CREATE TABLE IF NOT EXISTS "Vehicle" (
    "vehicle_id" VARCHAR(10) PRIMARY KEY,
    "plate_number" VARCHAR(20) NOT NULL,
    "vehicle_type" VARCHAR(30),
    "brand" VARCHAR(50),
    "model" VARCHAR(50),
    "year" INTEGER,
    "color" VARCHAR(30),
    "customer_id" VARCHAR(10) REFERENCES "Customer"("customer_id")
);

-- 4. งานซ่อม (Service Request & Job)
CREATE TABLE IF NOT EXISTS "ServiceRequest" (
    "request_id" VARCHAR(10) PRIMARY KEY,
    "checking_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "request_status" VARCHAR(30) DEFAULT 'Pending',
    "problem_description" TEXT,
    "odometer" INTEGER,
    "customer_id" VARCHAR(10) REFERENCES "Customer"("customer_id"),
    "vehicle_id" VARCHAR(10) REFERENCES "Vehicle"("vehicle_id"),
    "clerk_id" VARCHAR(10) REFERENCES "Employee"("employee_id"),
    "technician_id" VARCHAR(10) REFERENCES "Employee"("employee_id")
);

CREATE TABLE IF NOT EXISTS "ServiceJob" (
    "service_id" VARCHAR(10) PRIMARY KEY,
    "start_time" TIMESTAMP,
    "end_time" TIMESTAMP,
    "service_details" TEXT,
    "job_status" VARCHAR(30),
    "labor_cost" DECIMAL(10,2),
    "request_id" VARCHAR(10) REFERENCES "ServiceRequest"("request_id")
);

-- 5. อะไหล่ (Part & Inventory)
CREATE TABLE IF NOT EXISTS "Part" (
    "part_id" VARCHAR(10) PRIMARY KEY,
    "part_name" VARCHAR(100) NOT NULL,
    "stock_quantity" INTEGER DEFAULT 0,
    "price" DECIMAL(10,2),
    "reorder_point" INTEGER,
    "reserved_qty" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "UsePart" (
    "service_id" VARCHAR(10) REFERENCES "ServiceJob"("service_id"),
    "part_id" VARCHAR(10) REFERENCES "Part"("part_id"),
    "quantity" INTEGER,
    PRIMARY KEY ("service_id", "part_id")
);