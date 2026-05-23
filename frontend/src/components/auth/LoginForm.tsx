"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

import { FcGoogle } from "react-icons/fc";

import { useState } from "react";

import { useForm } from "react-hook-form";

import { z } from "zod";

import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";
import { SocialLoginButton } from "./SocialLoginButton";

import { loginSchema } from "../../schemas/auth.schema";

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit?: (
    values: LoginFormValues
  ) => void | Promise<void>;

  onNavigateToRegister?: () => void;

  onGoogleLogin?: () => void | Promise<void>;

  isLoading?: boolean;

  error?: string | null;
}

export function LoginForm({
  onSubmit,
  onNavigateToRegister,
  onGoogleLogin,
  isLoading = false,
  error,
}: LoginFormProps) {
  const [showPassword, setShowPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as never,

    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleFormSubmit = async (
    values: LoginFormValues
  ) => {
    await onSubmit?.(values);
  };

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
    >
      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="text-sm font-medium text-[#2C2C2C]"
        >
          Email
        </label>

        <AuthInput
          id="login-email"
          type="email"
          placeholder="Enter your email"
          icon={Mail}
          hasError={Boolean(errors.email)}
          {...register("email")}
        />

        {errors.email && (
          <p className="text-sm text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="login-password"
          className="text-sm font-medium text-[#2C2C2C]"
        >
          Password
        </label>

        <div className="relative">
          <AuthInput
            id="login-password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Enter your password"
            icon={Lock}
            hasError={Boolean(errors.password)}
            className="pr-12"
            {...register("password")}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#7C8C6B]"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="text-sm text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-[#E5E7E1] text-[#9CAF88] focus:ring-[#9CAF88]"
            {...register("rememberMe")}
          />

          <span className="text-sm text-[#6B7280]">
            Remember me
          </span>
        </label>

        <button
          type="button"
          className="text-sm text-[#7C8C6B] hover:text-[#9CAF88]"
        >
          Forgot password?
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Submit */}
      <AuthButton
        type="submit"
        disabled={isLoading}
      >
        {isLoading
          ? "Signing in..."
          : "Sign In"}
      </AuthButton>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#E5E7E1]" />
        </div>

        <div className="relative flex justify-center text-sm">
          <span className="bg-[#F6F7F2] px-4 text-[#6B7280]">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google */}
      <SocialLoginButton
        icon={<FcGoogle size={22} />}
        label="Continue with Google"
        onClick={() =>
          onGoogleLogin?.()
        }
        disabled={isLoading}
      />

      {/* Navigate */}
      <p className="mt-4 text-center text-sm text-[#6B7280]">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() =>
            onNavigateToRegister?.()
          }
          className="font-semibold text-[#7C8C6B] hover:text-[#9CAF88]"
        >
          Sign up
        </button>
      </p>
    </form>
  );
}