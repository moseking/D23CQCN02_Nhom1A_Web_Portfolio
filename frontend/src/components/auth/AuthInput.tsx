import type { ComponentPropsWithoutRef, ElementType } from 'react';

interface AuthInputProps extends ComponentPropsWithoutRef<'input'> {
  icon?: ElementType;
  hasError?: boolean;
}

export function AuthInput({ icon: Icon, className, hasError, ...props }: AuthInputProps) {
  return (
    <div className="relative">
      {Icon ? <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" /> : null}
      <input
        aria-invalid={hasError}
        className={`w-full h-auto py-3 bg-white border border-[#E5E7E1] rounded-xl focus-visible:ring-[#9CAF88] focus-visible:border-transparent text-[#2D2D2D] placeholder:text-[#6B7280] ${Icon ? 'pl-11' : 'pl-4'} ${className ?? ''}`}
        {...props}
      />
    </div>
  );
}
