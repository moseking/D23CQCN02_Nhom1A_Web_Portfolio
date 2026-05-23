"use client";

import { useState } from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Login }
  from "../../components/auth/Login";

import { Register }
  from "../../components/auth/Register";

export default function AuthPage() {

  const router = useRouter();

  const searchParams =
    useSearchParams();

  const mode =
    searchParams.get("mode");

  const [isLogin, setIsLogin] =
    useState(mode !== "register");

  return isLogin ? (
    <Login
      onNavigateToRegister={() =>
        setIsLogin(false)
      }

      onNavigateToHome={() =>
        router.push("/feed")
      }
    />
  ) : (
    <Register
      onNavigateToLogin={() =>
        setIsLogin(true)
      }

      onNavigateToHome={() =>
        router.push("/feed")
      }
    />
  );
}