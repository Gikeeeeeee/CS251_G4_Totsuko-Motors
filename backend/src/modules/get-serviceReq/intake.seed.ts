import { sql } from 'drizzle-orm';
import { db } from '../../db'; // เช็ค Path ให้ตรงกับโฟลเดอร์ db ของคุณด้วยนะครับ
import * as dotenv from 'dotenv';

dotenv.config();

async function seedIntakeRequests() {
  console.log('Starting seed mock data for testing, INTAKE...');

  try {
    // ลบข้อมูลเก่าก่อนเพื่อไม่ให้ PK ซ้ำเวลาเพื่อนรันหลายรอบ
    await db.execute(sql`DELETE FROM "ServiceRequest"`);
    
    // ยิงข้อมูล 15 รายการ
    await db.execute(sql`
      INSERT INTO "ServiceRequest" 
      ("request_id", "checking_date", "request_status", "problem_description", "odometer") 
      VALUES
      ('REQ-001', NOW() - INTERVAL '1 hour', 'INTAKE', 'เปลี่ยนถ่ายน้ำมันเครื่อง', 15000),
      ('REQ-002', NOW() - INTERVAL '2 hours', 'INTAKE', 'เช็คระยะ 20,000 กม.', 20000),
      ('REQ-003', NOW() - INTERVAL '3 hours', 'INTAKE', 'ผ้าเบรกมีเสียงดัง', 35000),
      ('REQ-004', NOW() - INTERVAL '4 hours', 'INTAKE', 'แอร์ไม่เย็น', 42000),
      ('REQ-005', NOW() - INTERVAL '5 hours', 'INTAKE', 'สลับยาง ถ่วงล้อ', 50000),
      ('REQ-006', NOW() - INTERVAL '6 hours', 'INTAKE', 'เปลี่ยนแบตเตอรี่', 65000),
      ('REQ-007', NOW() - INTERVAL '7 hours', 'INTAKE', 'ไฟหน้าขาด', 70000),
      ('REQ-008', NOW() - INTERVAL '8 hours', 'INTAKE', 'ช่วงล่างมีเสียงดังกุกกัก', 82000),
      ('REQ-009', NOW() - INTERVAL '9 hours', 'INTAKE', 'พวงมาลัยสั่นที่ความเร็วสูง', 90000),
      ('REQ-010', NOW() - INTERVAL '10 hours', 'INTAKE', 'เช็ครอยรั่วซึมใต้ท้องรถ', 105000),
      ('REQ-011', NOW() - INTERVAL '11 hours', 'INTAKE', 'เปลี่ยนหัวเทียน', 120000),
      ('REQ-012', NOW() - INTERVAL '12 hours', 'INTAKE', 'ล้างแอร์แบบถอดตู้', 135000),
      ('REQ-013', NOW() - INTERVAL '13 hours', 'PENDING', 'รอเบิกอะไหล่โช้คอัพ', 40000),
      ('REQ-014', NOW() - INTERVAL '14 hours', 'PENDING', 'รอประเมินราคาซ่อมสี', 15000),
      ('REQ-015', NOW() - INTERVAL '15 hours', 'COMPLETED', 'เปลี่ยนปัดน้ำฝนเสร็จแล้ว', 22000);
    `);
    
    console.log('Success! Mock data for INTAKE service requests has been seeded.');
  } catch (error) {
    console.error('Error occurred while seeding mock data:', error);
  }

  process.exit(0);
}

seedIntakeRequests();