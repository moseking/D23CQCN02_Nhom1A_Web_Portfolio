import type { ComponentPropsWithoutRef } from "react";

interface AuthButtonProps
  extends ComponentPropsWithoutRef<"button"> {
  isLoading?: boolean;
}

export function AuthButton({
  className = "",
  children,
  isLoading,
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      className={`
        w-full
        py-3
        rounded-xl
        bg-[#9CAF88]
        text-white
        font-medium
        transition-all
        hover:bg-[#7C8C6B]
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
}