import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;

  variant?:
    | "default"
    | "danger"
    | "warning"
    | "success"
    | "muted";
}

export default function Badge({
  children,
  variant = "default",
}: BadgeProps) {
  const styles: Record<string, string> = {
    default:
      "bg-[#F0F4EC] text-[#4A6741]",

    danger:
      "bg-[#FFEBEB] text-[#C62828]",

    warning:
      "bg-[#FEF3C7] text-[#92400E]",

    success:
      "bg-[#F0F4EC] text-[#4A6741]",

    muted:
      "bg-[#F3F4F6] text-[#6B7280]",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2
        py-0.5
        text-xs
        font-medium
        ${styles[variant]}
      `}
    >
      {children}
    </span>
  );
}
