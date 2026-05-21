import { Search, User } from 'lucide-react';

interface NavbarProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
}

export function Navbar({ onNavigateToLogin, onNavigateToRegister, onNavigateToHome }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#F6F7F2]/90 backdrop-blur-md border-b border-[#E5E7E1] z-50">
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={onNavigateToHome} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#9CAF88] rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white text-base font-serif">✦</span>
              </div>
              <span className="text-xl font-semibold text-[#2D2D2D] tracking-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Artfolio
              </span>
            </button>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="#" className="text-[#6B7280] hover:text-[#7C8C6B] transition-colors font-medium">
                Explore
              </a>
              <a href="#" className="text-[#6B7280] hover:text-[#7C8C6B] transition-colors font-medium">
                Trending
              </a>
              <a href="#" className="text-[#6B7280] hover:text-[#7C8C6B] transition-colors font-medium">
                Portfolio Styles
              </a>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                placeholder="Search for creative work..."
                className="w-full pl-10 pr-4 py-2 bg-[#E5E7E1]/60 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#9CAF88] focus:bg-white transition-all placeholder:text-[#6B7280] text-[#2D2D2D]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToLogin}
              className="hidden md:block px-4 py-2 text-sm text-[#6B7280] hover:text-[#7C8C6B] transition-colors font-medium"
            >
              Login
            </button>
            <button
              onClick={onNavigateToRegister}
              className="px-5 py-2 bg-[#9CAF88] text-white rounded-full text-sm hover:bg-[#7C8C6B] transition-colors shadow-sm"
            >
              Sign Up
            </button>
            <div className="w-9 h-9 bg-[#E5E7E1] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#AEC3AE] transition-colors">
              <User className="w-5 h-5 text-[#6B7280]" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
