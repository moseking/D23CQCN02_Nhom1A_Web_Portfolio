"use client";

import { AuthLayout } from './AuthLayout';
import { AuthShowcase } from './AuthShowcase';
import { RegisterForm } from './RegisterForm';
import { useAuthStore } from '../../store/authStore';
import type { RegisterFormValues } from '../../schemas/auth.schema';

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

  const handleSubmit = async (values: RegisterFormValues) => {
    await register(values);
    onNavigateToHome();
  };


  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the creative community today"
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
      <RegisterForm
        onSubmit={handleSubmit}
        onNavigateToLogin={onNavigateToLogin}
        isLoading={isLoading}
        error={error}
      />
    </AuthLayout>
  );
}
