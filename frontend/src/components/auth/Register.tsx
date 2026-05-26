"use client";

import {
  useState,
  type FormEvent,
} from "react";

import { AuthLayout } from './AuthLayout';
import { AuthShowcase } from './AuthShowcase';
import { RegisterForm } from './RegisterForm';
import { useAuthStore } from '../../store/authStore';
import type { RegisterFormValues } from '../../schemas/auth.schema';
import { authService } from "../../services/authService";

interface RegisterProps {
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

const registerShowcaseImages = [
  {
    src: "/images/auth/img1.jpg",
    className: 'absolute top-16 right-8',
    motionClassName: 'w-44 h-56 rounded-2xl overflow-hidden shadow-2xl bg-[#E5E7E1]',
    animate: { y: [0, -20, 0], rotate: [0, -3, 0] },
    duration: 6,
  },
  {
    src: "/images/auth/img2.jpg",
    className: 'absolute bottom-16 left-8',
    motionClassName: 'w-36 h-36 rounded-2xl overflow-hidden shadow-2xl bg-[#E5E7E1]',
    animate: { y: [0, 15, 0], rotate: [0, 3, 0] },
    duration: 7,
    delay: 1,
  },
  {
    src: "/images/auth/img3.jpg",
    className: 'absolute top-1/2 left-16',
    motionClassName: 'w-32 h-44 rounded-2xl overflow-hidden shadow-2xl bg-[#E5E7E1]',
    animate: { y: [0, -15, 0] },
    duration: 5,
    delay: 2,
  },
];

const registerFeatures = ['Masonry portfolios', 'Creator analytics', 'Global community'];

export function Register({ onNavigateToLogin, onNavigateToHome }: RegisterProps) {
  const { register, isLoading, error } = useAuthStore();
  const [pendingEmail, setPendingEmail] =
    useState("");
  const [otp, setOtp] = useState("");
  const [verifyError, setVerifyError] =
    useState("");
  const [
    verifySuccess,
    setVerifySuccess,
  ] = useState("");
  const [
    isVerifying,
    setIsVerifying,
  ] = useState(false);

  const handleSubmit = async (values: RegisterFormValues) => {
    const data =
      await register(values);

    setPendingEmail(
      data.email || values.email
    );
    setVerifyError("");
    setVerifySuccess(
      data.message ||
        "Verification code has been sent to your email."
    );
  };

  const handleVerifySubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (!pendingEmail || !otp) {
        setVerifyError(
          "Email and OTP are required"
        );
        return;
      }

      try {
        setIsVerifying(true);
        setVerifyError("");
        setVerifySuccess("");

        const res =
          await authService.verifyEmail({
            email: pendingEmail,
            otp: otp.trim(),
          });

        setVerifySuccess(
          res.data.message ||
            "Email verified successfully"
        );
        setOtp("");

        setTimeout(() => {
          onNavigateToLogin();
        }, 800);
      } catch (error: any) {
        setVerifyError(
          error.response?.data?.message ||
            "Verify email failed"
        );
      } finally {
        setIsVerifying(false);
      }
    };

  const handleResendOtp =
    async () => {
      try {
        setIsVerifying(true);
        setVerifyError("");
        setVerifySuccess("");

        const res =
          await authService.resendOtp({
            email: pendingEmail,
          });

        setVerifySuccess(
          res.data.message ||
            "Verification OTP has been sent to your email"
        );
      } catch (error: any) {
        setVerifyError(
          error.response?.data?.message ||
            "Could not resend OTP"
        );
      } finally {
        setIsVerifying(false);
      }
    };

  const verifyForm =
    (
      <form
        className="space-y-5"
        onSubmit={handleVerifySubmit}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-[#2C2C2C]">
            Email
          </label>
          <input
            type="email"
            value={pendingEmail}
            readOnly
            className="w-full rounded-xl border border-[#E5E7E1] bg-white px-4 py-3 text-sm text-[#2C2C2C]"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="verify-otp"
            className="text-sm font-medium text-[#2C2C2C]"
          >
            Verification OTP
          </label>
          <input
            id="verify-otp"
            type="text"
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value)
            }
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className="w-full rounded-xl border border-[#E5E7E1] bg-white px-4 py-3 text-sm text-[#2C2C2C] outline-none focus:border-[#9CAF88] focus:ring-2 focus:ring-[#9CAF88]/20"
          />
        </div>

        {verifyError && (
          <p className="text-sm text-red-600">
            {verifyError}
          </p>
        )}

        {verifySuccess && (
          <p className="text-sm text-[#557048]">
            {verifySuccess}
          </p>
        )}

        <button
          type="submit"
          disabled={isVerifying}
          className="w-full rounded-xl bg-[#7C8C6B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6F7F60] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isVerifying
            ? "Verifying..."
            : "Verify Email"}
        </button>

        <button
          type="button"
          onClick={handleResendOtp}
          disabled={isVerifying}
          className="w-full text-sm font-semibold text-[#7C8C6B] hover:text-[#9CAF88] disabled:cursor-not-allowed disabled:opacity-70"
        >
          Resend OTP
        </button>
      </form>
    );


  return (
    <AuthLayout
      title={
        pendingEmail
          ? "Verify your email"
          : "Create your account"
      }
      subtitle={
        pendingEmail
          ? "Enter the OTP sent to your Gmail"
          : "Join the creative community today"
      }
      onNavigateToHome={onNavigateToHome}
      compactHeader
      leftSection={
        <AuthShowcase
          title="Start Your Creative Journey"
          subtitle="Build your portfolio, connect with creators, and showcase your best work to the world"
          background="linear-gradient(145deg, #AEC3AE 0%, #9CAF88 50%, #7C8C6B 100%)"
          radialStart="bg-[radial-gradient(ellipse_at_20%_20%,rgba(255,255,255,0.18),transparent_55%)]"
          radialEnd="bg-[radial-gradient(ellipse_at_80%_80%,rgba(44,44,44,0.08),transparent_55%)]"
          images={registerShowcaseImages}
          footer={
            <div className="absolute bottom-10 right-8 flex flex-col gap-2">
              {registerFeatures.map((feature) => (
                <div key={feature} className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-white text-sm font-medium">
                  {'* '}
                  {feature}
                </div>
              ))}
            </div>
          }
        />
      }
    >
      {pendingEmail ? (
        verifyForm
      ) : (
        <RegisterForm
          onSubmit={handleSubmit}
          onNavigateToLogin={onNavigateToLogin}
          isLoading={isLoading}
          error={error}
        />
      )}
    </AuthLayout>
  );
}
