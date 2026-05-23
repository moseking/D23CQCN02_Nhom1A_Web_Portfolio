"use client";

import { useState } from "react";

import { Login } from "../../components/auth/Login";
import { Register } from "../../components/auth/Register";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <Login
      onNavigateToRegister={() => setIsLogin(false)}
      onNavigateToHome={() => {}}
    />
  ) : (
    <Register
      onNavigateToLogin={() => setIsLogin(true)}
      onNavigateToHome={() => {}}
    />
  );
}