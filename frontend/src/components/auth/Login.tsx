"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

import { AuthLayout } from "./AuthLayout";
import { AuthShowcase } from "./AuthShowcase";
import { LoginForm } from "./LoginForm";

import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";

import type {
  LoginFormValues,
} from "../../schemas/auth.schema";

interface LoginProps {
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
}

const loginShowcaseImages = [
  {
    src: "/images/auth/img1.jpg",

    className:
      "absolute top-10 right-8",

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

    className:
      "absolute bottom-20 left-0",

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

    className:
      "absolute top-1/2 left-24",

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
  const router = useRouter();
  const [isForgotMode, setIsForgotMode] =
    useState(false);
  const [resetEmail, setResetEmail] =
    useState("");
  const [resetOtp, setResetOtp] =
    useState("");
  const [
    newPassword,
    setNewPassword,
  ] = useState("");
  const [
    resetMessage,
    setResetMessage,
  ] = useState("");
  const [
    resetError,
    setResetError,
  ] = useState("");
  const [
    isResetLoading,
    setIsResetLoading,
  ] = useState(false);
  const [otpSent, setOtpSent] =
    useState(false);

  const {
    login,
    isLoading,
    error,
  } = useAuthStore();

  const handleSubmit =
    async (
      data: LoginFormValues
    ) => {
      try {
        await login(data);

        const user =
          useAuthStore
            .getState()
            .user;

        if (
          user?.role ===
          "admin"
        ) {
          router.push(
            "/admin"
          );
        } else {
          router.push("/");
        }
      } catch (error) {
        console.log(error);
      }
    };

  const handleSendResetOtp =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (!resetEmail) {
        setResetError(
          "Email is required"
        );
        return;
      }

      try {
        setIsResetLoading(true);
        setResetError("");
        setResetMessage("");

        const res =
          await authService.forgotPassword({
            email: resetEmail,
          });

        setOtpSent(true);
        setResetMessage(
          res.data.message ||
            "OTP has been sent to your email"
        );
      } catch (error: any) {
        setResetError(
          error.response?.data?.message ||
            "Could not send OTP"
        );
      } finally {
        setIsResetLoading(false);
      }
    };

  const handleResetPassword =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (
        !resetEmail ||
        !resetOtp ||
        !newPassword
      ) {
        setResetError(
          "Email, OTP and new password are required"
        );
        return;
      }

      try {
        setIsResetLoading(true);
        setResetError("");
        setResetMessage("");

        const res =
          await authService.resetPassword({
            email: resetEmail,
            otp: resetOtp.trim(),
            password:
              newPassword,
          });

        setResetMessage(
          res.data.message ||
            "Password reset successful"
        );
        setResetOtp("");
        setNewPassword("");

        setTimeout(() => {
          setIsForgotMode(false);
          setOtpSent(false);
        }, 900);
      } catch (error: any) {
        setResetError(
          error.response?.data?.message ||
            "Could not reset password"
        );
      } finally {
        setIsResetLoading(false);
      }
    };

  const forgotPasswordForm = (
    <form
      className="space-y-5"
      onSubmit={
        otpSent
          ? handleResetPassword
          : handleSendResetOtp
      }
    >
      <div className="space-y-2">
        <label
          htmlFor="reset-email"
          className="text-sm font-medium text-[#2C2C2C]"
        >
          Email
        </label>
        <input
          id="reset-email"
          type="email"
          value={resetEmail}
          onChange={(event) =>
            setResetEmail(
              event.target.value
            )
          }
          readOnly={otpSent}
          placeholder="Enter your email"
          className="w-full rounded-xl border border-[#E5E7E1] bg-white px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#9CAF88] focus:ring-2 focus:ring-[#9CAF88]/20"
        />
      </div>

      {otpSent && (
        <>
          <div className="space-y-2">
            <label
              htmlFor="reset-otp"
              className="text-sm font-medium text-[#2C2C2C]"
            >
              OTP
            </label>
            <input
              id="reset-otp"
              type="text"
              value={resetOtp}
              onChange={(event) =>
                setResetOtp(
                  event.target.value
                )
              }
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter OTP"
              className="w-full rounded-xl border border-[#E5E7E1] bg-white px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#9CAF88] focus:ring-2 focus:ring-[#9CAF88]/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="text-sm font-medium text-[#2C2C2C]"
            >
              New password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              placeholder="Enter new password"
              className="w-full rounded-xl border border-[#E5E7E1] bg-white px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#9CAF88] focus:ring-2 focus:ring-[#9CAF88]/20"
            />
          </div>
        </>
      )}

      {resetError && (
        <p className="text-sm text-red-600">
          {resetError}
        </p>
      )}

      {resetMessage && (
        <p className="text-sm text-[#557048]">
          {resetMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isResetLoading}
        className="w-full rounded-xl bg-[#7C8C6B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6F7F60] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isResetLoading
          ? "Please wait..."
          : otpSent
          ? "Reset Password"
          : "Send OTP"}
      </button>

      <button
        type="button"
        onClick={() => {
          setIsForgotMode(false);
          setOtpSent(false);
          setResetError("");
          setResetMessage("");
        }}
        className="w-full text-sm font-semibold text-[#7C8C6B] hover:text-[#9CAF88]"
      >
        Back to sign in
      </button>
    </form>
  );

  return (
    <AuthLayout
      title={
        isForgotMode
          ? "Reset password"
          : "Welcome back"
      }
      subtitle={
        isForgotMode
          ? "Use the OTP sent to your email"
          : "Sign in to your creative space"
      }
      onNavigateToHome={
        onNavigateToHome
      }
      leftSection={
        <AuthShowcase
          title="Share Your Creative Identity"
          subtitle="Join thousands of designers worldwide showcasing their best work"
          background="linear-gradient(145deg, #9CAF88 0%, #7C8C6B 40%, #AEC3AE 100%)"
          radialStart="bg-[radial-gradient(ellipse_at_25%_25%,rgba(255,255,255,0.15),transparent_55%)]"
          radialEnd="bg-[radial-gradient(ellipse_at_75%_75%,rgba(44,44,44,0.1),transparent_55%)]"
          images={
            loginShowcaseImages
          }
          footer={
            <div
              className="
                absolute
                bottom-12
                right-8
                rounded-2xl
                bg-white/20
                p-4
                text-white
                backdrop-blur-sm
              "
            >
              <p
                className="
                  text-2xl
                  font-semibold
                "
              >
                48K+
              </p>

              <p
                className="
                  text-sm
                  text-white/80
                "
              >
                Creative projects
              </p>
            </div>
          }
        />
      }
    >
      {isForgotMode ? (
        forgotPasswordForm
      ) : (
        <LoginForm
          onSubmit={handleSubmit}
          onNavigateToRegister={
            onNavigateToRegister
          }
          onForgotPassword={() =>
            setIsForgotMode(true)
          }
          isLoading={isLoading}
          error={error}
        />
      )}
    </AuthLayout>
  );
}
