import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  const floatingImages = [
    'https://images.unsplash.com/photo-1767449441925-737379bc2c4d?w=400',
    'https://images.unsplash.com/photo-1697033300784-6c9d143a30e2?w=400',
    'https://images.unsplash.com/photo-1611926945285-9fa3dabd5b51?w=400',
  ];

  return (
    <div className="relative pt-32 pb-20 px-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #F6F7F2 0%, #EEF2EA 50%, #F6F7F2 100%)' }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(156,175,136,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(174,195,174,0.12),transparent_60%)]" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-[#9CAF88] font-semibold mb-4">Creative Portfolio Platform</p>
            <h1 className="text-6xl md:text-7xl mb-6 text-[#2D2D2D] leading-[1.1]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Showcase Your<br />
              <em className="not-italic text-[#9CAF88]">Creative Identity</em>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl text-[#6B7280] mb-10 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover UI/UX, Branding, Illustration &amp; Digital Art from creators around the world
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button className="px-8 py-3 bg-[#9CAF88] text-white rounded-full hover:bg-[#7C8C6B] transition-colors shadow-md hover:shadow-lg">
              Start Creating
            </button>
            <button className="px-8 py-3 border border-[#9CAF88] text-[#7C8C6B] rounded-full hover:bg-[#9CAF88]/10 transition-colors">
              Explore Works
            </button>
          </motion.div>

          <motion.div
            className="mt-10 flex items-center justify-center gap-8 text-sm text-[#6B7280]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <span><strong className="text-[#2D2D2D]">12,400+</strong> Creators</span>
            <span className="w-px h-4 bg-[#E5E7E1]" />
            <span><strong className="text-[#2D2D2D]">48K+</strong> Projects</span>
            <span className="w-px h-4 bg-[#E5E7E1]" />
            <span><strong className="text-[#2D2D2D]">180</strong> Countries</span>
          </motion.div>
        </div>

        <div className="hidden lg:block absolute top-20 left-10">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-48 h-64 rounded-2xl overflow-hidden shadow-xl bg-[#E5E7E1]"
          >
            <ImageWithFallback
              src={floatingImages[0]}
              alt="Creative work"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        <div className="hidden lg:block absolute top-40 right-10">
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="w-40 h-56 rounded-2xl overflow-hidden shadow-xl bg-[#E5E7E1]"
          >
            <ImageWithFallback
              src={floatingImages[1]}
              alt="Creative work"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        <div className="hidden lg:block absolute bottom-10 right-32">
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="w-44 h-44 rounded-2xl overflow-hidden shadow-xl bg-[#E5E7E1]"
          >
            <ImageWithFallback
              src={floatingImages[2]}
              alt="Creative work"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
