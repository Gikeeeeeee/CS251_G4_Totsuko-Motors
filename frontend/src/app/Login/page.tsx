'use client';

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authService } from "@/services/auth.service"; 
import { setUser } from "@/auth/auth";
// 1. Import ฟังก์ชันจากไฟล์แยกที่เราสร้างไว้
import { getRedirectPathByRole } from "@/utils/roleRedirect";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // ลบฟังก์ชัน redirectByRole (switch/case) ตรงนี้ออกไปแล้วครับ เพราะเราย้ายไปไว้ที่ utils แทน

  useEffect(() => {
    authService.verify()
      .then((data) => {
        if (data.success) {
          // กันเหนียว กรณี verify ผ่าน ให้เซ็ตลง Local Storage ด้วย
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('role', data.user.role);
          localStorage.setItem('employee_id', data.user.employeeId);

          setUser(data.user);
          // 2. เรียกใช้ฟังก์ชันจาก utils แล้วสั่ง router.push เลย
          router.push(getRedirectPathByRole(data.user.role));
        }
      })
      .catch(() => {
        // ปล่อยให้อยู่หน้า Login ต่อไป
      });
  }, [router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await authService.login(username, password);

      if (data.success) {
        // 🛠️ จุดสำคัญ: บันทึกข้อมูลลง Local Storage เพื่อให้ Auth Guard และหน้าอื่นๆ เรียกใช้ได้
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('employee_id', data.user.employeeId);

        setUser(data.user);
        
        // 3. เรียกใช้ฟังก์ชันจาก utils เช่นเดียวกัน
        router.push(getRedirectPathByRole(data.user.role));
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Username หรือ Password ไม่ถูกต้อง";
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#cfd6dc] flex justify-center items-center">
      <div className="w-[489px] bg-[#e9ecef] rounded-xl p-8 shadow-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-[#0b2c4a] text-2xl font-bold m-0">LOGIN</h2>
            <small className="text-gray-600">เข้าสู่ระบบ</small>
          </div>

          <div className="text-right font-bold text-[#0b2c4a]">
            <Image 
              src="/logo.png" 
              alt="Totsuko Motors Logo" 
              width={110} 
              height={110}
              className="mb-2"
            />
          </div>

        </div>

        {/* Divider */}
        <div className="h-px bg-[#c5ccd3] my-6"></div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <label className="block text-[13px] font-semibold text-[#0b2c4a] mb-2">
            USERNAME
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-3 rounded-md border-none bg-[#dbe1e6] mb-5 text-sm focus:outline-none focus:bg-[#eef2f6]"
          />

          <label className="block text-[13px] font-semibold text-[#0b2c4a] mb-2">
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-md border-none bg-[#dbe1e6] mb-5 text-sm focus:outline-none focus:bg-[#eef2f6]"
          />

          <button 
            type="submit"
            className="w-3/5 mx-auto block mt-4 p-3 bg-gradient-to-r from-[#0b2c4a] to-[#173f66] text-white border-none rounded-lg text-base cursor-pointer shadow-md hover:opacity-90 transition-opacity"
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
}