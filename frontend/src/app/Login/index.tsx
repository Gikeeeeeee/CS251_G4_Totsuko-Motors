import React, { useState } from "react";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // mock logic
    if (username === "admin" && password === "1234") {
      alert("Login สำเร็จ (Admin)");
    } else {
      alert("Username หรือ Password ไม่ถูกต้อง");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="header">
          <div>
            <h2>LOGIN</h2>
            <small>เข้าสู่ระบบ</small>
          </div>

          <div className="logo">
            TOTSUKO
            <span>MOTORS</span>
          </div>
        </div>

        <div className="divider"></div>

        <form onSubmit={handleLogin}>
          <label>USERNAME</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

      </div>
    </div>
  );
}