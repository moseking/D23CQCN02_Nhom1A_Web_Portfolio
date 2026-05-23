"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";


import { useState } from "react";

import { useForm } from "react-hook-form";

import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";
import { SocialLoginButton } from "./SocialLoginButton";

import {
  registerSchema,
  type RegisterFormValues,
} from "../../schemas/auth.schema";

interface RegisterFormProps {
  onSubmit: (
    values: RegisterFormValues
  ) => void | Promise<void>;

  onNavigateToLogin: () => void;


  isLoading?: boolean;

  error?: string | null;
}

export function RegisterForm({
  onSubmit,
  onNavigateToLogin,
  isLoading = false,
  error,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver:
      zodResolver(registerSchema) as never,

    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {/* Username */}
      <div className="space-y-2">
        <label
          htmlFor="register-username"
          className="text-sm font-medium text-[#2C2C2C]"
        >
          Username
        </label>

        <AuthInput
          id="register-username"
          type="text"
          placeholder="Choose a username"
          icon={User}
          hasError={Boolean(errors.username)}
          {...register("username")}
        />

        {errors.username && (
          <p className="text-sm text-red-500">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="register-email"
          className="text-sm font-medium text-[#2C2C2C]"
        >
          Email
        </label>

        <AuthInput
          id="register-email"
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
          htmlFor="register-password"
          className="text-sm font-medium text-[#2C2C2C]"
        >
          Password
        </label>

        <div className="relative">
          <AuthInput
            id="register-password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Create a password"
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

      {/* Confirm Password */}
      <div className="space-y-2">
        <label
          htmlFor="register-confirm-password"
          className="text-sm font-medium text-[#2C2C2C]"
        >
          Confirm Password
        </label>

        <div className="relative">
          <AuthInput
            id="register-confirm-password"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            placeholder="Confirm your password"
            icon={Lock}
            hasError={Boolean(
              errors.confirmPassword
            )}
            className="pr-12"
            {...register("confirmPassword")}
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#7C8C6B]"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {errors.confirmPassword && (
          <p className="text-sm text-red-500">
            {
              errors.confirmPassword
                .message
            }
          </p>
        )}
      </div>

      {/* Terms */}
      <div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 h-4 w-4 rounded border-[#E5E7E1] text-[#9CAF88] focus:ring-[#9CAF88]"
            {...register("acceptTerms")}
          />

          <label
            htmlFor="terms"
            className="text-sm text-[#6B7280]"
          >
            I agree to the{" "}
            <button
              type="button"
              className="text-[#7C8C6B] hover:text-[#9CAF88]"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="text-[#7C8C6B] hover:text-[#9CAF88]"
            >
              Privacy Policy
            </button>
          </label>
        </div>

        {errors.acceptTerms && (
          <p className="mt-1 text-sm text-red-500">
            {
              errors.acceptTerms
                .message
            }
          </p>
        )}
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
          ? "Creating account..."
          : "Create Account"}
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


      {/* Navigate */}
      <p className="mt-4 text-center text-sm text-[#6B7280]">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="font-semibold text-[#7C8C6B] hover:text-[#9CAF88]"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}