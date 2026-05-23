import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  onNavigateToHome: () => void;
  leftSection: ReactNode;
  children: ReactNode;
  compactHeader?: boolean;
}

export function AuthLayout({
  title,
  subtitle,
  onNavigateToHome,
  leftSection,
  children,
  compactHeader = false,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 items-center justify-center">
        {leftSection}
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#F6F7F2] overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={compactHeader ? 'mb-7' : 'mb-8'}>
            <button
              type="button"
              className={compactHeader ? 'flex items-center gap-2 mb-5 px-0 text-[#2D2D2D] hover:bg-transparent' : 'flex items-center gap-2 mb-6 px-0 text-[#2D2D2D] hover:bg-transparent'}
              onClick={onNavigateToHome}
            >
              <span className="w-9 h-9 bg-[#9CAF88] rounded-xl flex items-center justify-center shadow-sm text-white text-lg">*</span>
              <span className="text-xl font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Artfolio
              </span>
            </button>
            <h1 className="text-3xl text-[#2D2D2D] mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {title}
            </h1>
            <p className="text-[#6B7280]">{subtitle}</p>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
