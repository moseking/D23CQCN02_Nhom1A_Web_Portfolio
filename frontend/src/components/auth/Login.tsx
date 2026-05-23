

"use client";

import { AuthLayout } from "./AuthLayout";
import { AuthShowcase } from "./AuthShowcase";
import { LoginForm } from "./LoginForm";

import { useAuthStore } from "../../store/authStore";

import type { LoginFormValues } from "../../schemas/auth.schema";

interface LoginProps {
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
}

const loginShowcaseImages = [
  {
    src: "/images/auth/img1.jpg",
    className: "absolute top-10 right-8",

    motionClassName:
      "w-40 h-52 rounded-2xl overflow-hidden shadow-2xl bg-[#E5E7E1]",

    animate: {
      y: [0, -20, 0],
      rotate: [0, 3, 0],
    },

    duration: 6,
  },

  {
    src: "/images/auth/img2.jpg",
    className: "absolute bottom-20 left-0",

    motionClassName:
      "w-36 h-44 rounded-2xl overflow-hidden shadow-2xl bg-[#E5E7E1]",

    animate: {
      y: [0, 15, 0],
      rotate: [0, -3, 0],
    },

    duration: 7,
    delay: 1,
  },

  {
    src: "/images/auth/img3.jpg",
    className: "absolute top-1/2 left-24",

    motionClassName:
      "w-28 h-28 rounded-2xl overflow-hidden shadow-2xl bg-[#E5E7E1]",

    animate: {
      y: [0, -15, 0],
    },

    duration: 5,
    delay: 2,
  },
];

export function Login({
  onNavigateToRegister,
  onNavigateToHome,
}: LoginProps) {
  const {
    login,
    loginWithGoogle,
    isLoading,
    error,
  } = useAuthStore();

  const handleSubmit = async (
    values: LoginFormValues
  ) => {
    await login(values);

    onNavigateToHome();
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();

    onNavigateToHome();
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your creative space"
      onNavigateToHome={onNavigateToHome}
      leftSection={
        <AuthShowcase
          title="Share Your Creative Identity"
          subtitle="Join thousands of designers worldwide showcasing their best work"
          background="linear-gradient(145deg, #9CAF88 0%, #7C8C6B 40%, #AEC3AE 100%)"
          radialStart="bg-[radial-gradient(ellipse_at_25%_25%,rgba(255,255,255,0.15),transparent_55%)]"
          radialEnd="bg-[radial-gradient(ellipse_at_75%_75%,rgba(44,44,44,0.1),transparent_55%)]"
          images={loginShowcaseImages}
          footer={
            <div className="absolute bottom-12 right-8 bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white">
              <p className="text-2xl font-semibold">
                48K+
              </p>

              <p className="text-sm text-white/80">
                Creative projects
              </p>
            </div>
          }
        />
      }
    >
      <LoginForm
        onSubmit={handleSubmit}
        onNavigateToRegister={
          onNavigateToRegister
        }
        onGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
        error={error}
      />
    </AuthLayout>
  );
}
