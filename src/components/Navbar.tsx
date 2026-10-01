import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, User as UserIcon, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { User } from '@firebase/auth';
import { Logo } from './Logo';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenRequest: () => void;
  onOpenDashboard: () => void;
  isAdmin: boolean;
  adminEmail: string;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onOpenRequest,
  onOpenDashboard,
  isAdmin,
  adminEmail,
  onOpenAdmin,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070420]/95 backdrop-blur-md border-b border-white/10 py-3.5 shadow-xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Zone 1: Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <Logo />
        </a>

        {/* Zone 2: Nav links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-neutral-300 font-['DM_Sans',sans-serif]">
          <a href="#services" className="hover:text-cyan-400 transition-colors">
            Services
          </a>
          <a href="#who-we-build" className="hover:text-cyan-400 transition-colors">
            Audience
          </a>
          <a href="#process" className="hover:text-cyan-400 transition-colors">
            Process
          </a>
          <a href="#capabilities" className="hover:text-cyan-400 transition-colors">
            Capabilities
          </a>
          <a href="#philosophy" className="hover:text-cyan-400 transition-colors">
            Philosophy
          </a>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="hidden md:flex items-center gap-3">
          {user || isAdmin ? (
            <div className="flex items-center gap-3">
              {user ? (
                <button
                  onClick={onOpenDashboard}
                  className="flex items-center gap-2 py-2.5 px-4 bg-white/10 border border-white/20 text-white rounded-xl text-xs font-semibold hover:border-cyan-400 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  <span className="truncate max-w-[120px]">{user.displayName || 'Dashboard'}</span>
                </button>
              ) : (
                <button onClick={onOpenAuth} className="text-xs font-semibold text-neutral-200 hover:text-cyan-400">
                  {adminEmail || 'Admin Session'}
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="py-2.5 px-3 bg-[#0D06B2] text-white rounded-xl text-xs font-semibold hover:bg-[#0a0490] transition-colors shadow-md border border-white/20"
                >
                  Admin CRM
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="py-2.5 px-4 text-xs font-semibold text-neutral-200 hover:text-cyan-400 transition-colors"
            >
              Sign In
            </button>
          )}

          <button
            onClick={onOpenRequest}
            className="py-2.5 px-5 bg-[#0D06B2] text-white rounded-xl text-xs font-medium hover:bg-[#0a0490] transition-all shadow-md hover:shadow-xl inline-flex items-center gap-1.5 group whitespace-nowrap border border-white/20"
          >
            <span>Request Your Site</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-white/80" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-[#070420] border-b border-white/10 p-6 shadow-2xl space-y-4 text-white animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3 text-base font-medium">
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-cyan-400">
              Services
            </a>
            <a href="#who-we-build" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-cyan-400">
              Audience
            </a>
            <a href="#process" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-cyan-400">
              Process
            </a>
            <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-cyan-400">
              Capabilities
            </a>
            <a href="#philosophy" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-cyan-400">
              Philosophy
            </a>
          </nav>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            {user || isAdmin ? (
              <>
                {!user && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium text-center"
                  >
                    {adminEmail || 'Admin Session'}
                  </button>
                )}
                {user && <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDashboard();
                  }}
                  className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium text-center flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Client Dashboard
                </button>}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full py-3 bg-[#0D06B2] text-white rounded-xl font-medium text-center border border-white/20"
                  >
                    Admin CRM
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-3 bg-white/10 border border-white/20 text-white rounded-xl font-medium text-center"
              >
                Sign In
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRequest();
              }}
              className="w-full py-3 bg-[#0D06B2] text-white rounded-xl font-medium text-center flex items-center justify-center gap-2 border border-white/20"
            >
              Request Your Site <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
