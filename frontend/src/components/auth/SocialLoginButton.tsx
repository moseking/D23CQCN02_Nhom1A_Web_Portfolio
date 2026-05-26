import type { ReactNode } from 'react';

interface SocialLoginButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function SocialLoginButton({ icon, label, onClick, disabled }: SocialLoginButtonProps) {
  return (
    <button
      type="button"
      className="w-full py-3 border border-[#E5E7E1] bg-white rounded-xl flex items-center justify-center gap-3 hover:border-[#AEC3AE] transition-colors text-[#2D2D2D] font-medium disabled:cursor-not-allowed disabled:opacity-60"
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
