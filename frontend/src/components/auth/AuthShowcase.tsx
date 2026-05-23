import { motion } from "framer-motion";
import type { ReactNode } from 'react';

interface FloatingImage {
  src: string;
  className: string;
  motionClassName: string;
  animate: {
    y?: number[];
    rotate?: number[];
  };
  duration: number;
  delay?: number;
}

interface AuthShowcaseProps {
  title: string;
  subtitle: string;
  background: string;
  radialStart: string;
  radialEnd: string;
  images: FloatingImage[];
  footer: ReactNode;
}

export function AuthShowcase({ title, subtitle, background, radialStart, radialEnd, images, footer }: AuthShowcaseProps) {
  return (
    <div className="absolute inset-0 p-12 flex items-center justify-center" style={{ background }}>
      <div className={`absolute inset-0 ${radialStart}`} />
      <div className={`absolute inset-0 ${radialEnd}`} />

      <div className="relative z-10 max-w-md w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h2 className="text-5xl text-white mb-4 leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            {title}
          </h2>
          <p className="text-lg text-white/80 mb-8">{subtitle}</p>
        </motion.div>

        {images.map((image) => (
          <div key={image.src} className={image.className}>
            <motion.div
              animate={image.animate}
              transition={{ duration: image.duration, repeat: Infinity, ease: 'easeInOut', delay: image.delay ?? 0 }}
              className={image.motionClassName}
            >
              <img src={image.src} alt="Creative work" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        ))}

        {footer}
      </div>
    </div>
  );
}
