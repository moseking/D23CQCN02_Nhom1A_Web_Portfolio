"use client";

import { Suspense, useState } from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { Login }
  from "../../components/auth/Login";

import { Register }
  from "../../components/auth/Register";

function AuthContent() {

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

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
