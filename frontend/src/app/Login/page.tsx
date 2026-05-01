'use client';

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // mock logic
    if (username === "admin" && password === "1234") {
      alert("Login สำเร็จ (Admin)");
      // redirect ไปหน้า technician request list
      router.push("/technician/request-list");
    } else {
      alert("Username หรือ Password ไม่ถูกต้อง");
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
