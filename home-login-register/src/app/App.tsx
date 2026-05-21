import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Register } from './components/Register';

type Page = 'home' | 'login' | 'register';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  return (
    <div className="min-h-screen bg-[#F6F7F2]">
      {currentPage !== 'login' && currentPage !== 'register' && (
        <Navbar
          onNavigateToLogin={() => setCurrentPage('login')}
          onNavigateToRegister={() => setCurrentPage('register')}
          onNavigateToHome={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'home' && <Home />}
      {currentPage === 'login' && (
        <Login
          onNavigateToRegister={() => setCurrentPage('register')}
          onNavigateToHome={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'register' && (
        <Register
          onNavigateToLogin={() => setCurrentPage('login')}
          onNavigateToHome={() => setCurrentPage('home')}
        />
      )}

      {currentPage === 'home' && (
        <footer className="bg-[#2D2D2D] text-white py-14 px-6">
          <div className="max-w-[1400px] mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#9CAF88] rounded-lg flex items-center justify-center">
                <span className="text-white">✦</span>
              </div>
              <span className="text-xl font-semibold" style={{ fontFamily: "'DM Serif Display', serif" }}>Artfolio</span>
            </div>
            <p className="text-[#6B7280] mb-8 max-w-sm mx-auto">
              The creative portfolio platform for designers, artists, and creators
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-[#6B7280]">
              <a href="#" className="hover:text-[#AEC3AE] transition-colors">About</a>
              <a href="#" className="hover:text-[#AEC3AE] transition-colors">Careers</a>
              <a href="#" className="hover:text-[#AEC3AE] transition-colors">Blog</a>
              <a href="#" className="hover:text-[#AEC3AE] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#AEC3AE] transition-colors">Terms</a>
            </div>
            <p className="text-[#6B7280]/60 text-sm mt-8">
              © 2026 Artfolio. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}