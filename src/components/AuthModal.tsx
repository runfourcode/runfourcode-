import React, { useState } from 'react';
import { X, LogIn, LogOut, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { User } from '@firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: () => Promise<void>;
  onAdminLogin: (email: string, password: string) => Promise<boolean>;
  onLogout: () => Promise<void>;
  onOpenDashboard: () => void;
  isAdmin: boolean;
  adminSessionEmail: string;
  onOpenAdmin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogin,
  onAdminLogin,
  onLogout,
  onOpenDashboard,
  isAdmin,
  adminSessionEmail,
  onOpenAdmin,
}) => {
  const [isAdminTab, setIsAdminTab] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');
  const [adminLoginPending, setAdminLoginPending] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#F7F5F2] border border-[#0D06B2]/20 shadow-2xl rounded-2xl p-6 md:p-8 overflow-hidden text-[#050505]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors text-neutral-600 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-block px-3 py-1 text-xs font-mono font-semibold tracking-wider text-white uppercase bg-[#0D06B2] rounded-md">
              runfourcode / AUTH
            </span>
            <button
              onClick={() => setIsAdminTab(!isAdminTab)}
              className="text-xs font-mono text-[#0D06B2] hover:underline font-semibold"
            >
              {isAdminTab ? 'Switch to Client Login' : '🔒 Admin Portal Access'}
            </button>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {user ? `Welcome back, ${user.displayName || 'Client'}` : isAdmin ? 'Admin Session' : isAdminTab ? 'Admin Authentication' : 'Ready to build something?'}
          </h2>
          <p className="text-neutral-600 text-sm mt-1">
            {isAdmin && !user
              ? 'Your admin session is verified by the application server.'
              : user
              ? 'Manage your project requests, track status, and chat directly with our engineering team.'
              : isAdminTab
              ? 'Sign in with the authorized admin email and password.'
              : 'Sign in with your Google account or access company admin portal.'}
          </p>
        </div>

        {user || isAdmin ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white border border-neutral-200 rounded-xl">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-full object-cover border border-neutral-300"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#0D06B2] text-white flex items-center justify-center font-bold">
                  {user?.displayName?.[0] || (isAdmin ? 'A' : 'U')}
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="font-semibold text-neutral-900 truncate">{user?.displayName || (isAdmin ? 'Administrator' : 'Client')}</h4>
                <p className="text-xs text-neutral-500 truncate">{user?.email || adminSessionEmail}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
                  {isAdmin && <span className="ml-1 px-1.5 py-0.2 bg-[#0D06B2]/10 text-[#0D06B2] rounded font-mono text-[10px]">ADMIN</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {user && <button
                onClick={() => {
                  onOpenDashboard();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#050505] text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-lg"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Client Dashboard
              </button>}

              {isAdmin && (
                <button
                  onClick={() => {
                    onOpenAdmin();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0D06B2] text-white rounded-xl font-medium hover:bg-[#0a0490] transition-colors shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" /> Open Admin CRM
                </button>
              )}

              <button
                onClick={async () => {
                  await onLogout();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        ) : isAdminTab ? (
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setAdminLoginPending(true);
              setAdminLoginError('');
              const success = await onAdminLogin(adminEmail.trim(), adminPassword);
              setAdminLoginPending(false);
              if (success) onClose();
              else setAdminLoginError('Sign-in failed. Check the admin email and password.');
            }}
          >
            <label className="block text-xs font-semibold text-neutral-600">
              Admin email
              <input
                type="email"
                autoComplete="username"
                required
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
                className="mt-1.5 w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#0D06B2]"
              />
            </label>
            <label className="block text-xs font-semibold text-neutral-600">
              Password
              <input
                type="password"
                autoComplete="current-password"
                required
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                className="mt-1.5 w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#0D06B2]"
              />
            </label>
            {adminLoginError && <p role="alert" className="text-sm text-red-700">{adminLoginError}</p>}
            <button
              type="submit"
              disabled={adminLoginPending}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#0D06B2] text-white rounded-xl font-medium hover:bg-[#0a0490] transition-colors shadow-lg disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" /> {adminLoginPending ? 'Signing in...' : 'Sign in to Admin'}
            </button>
            <p className="text-xs text-neutral-500 text-center">
              Credentials are checked by the server and this session is stored in a secure browser cookie.
            </p>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-white border border-neutral-200 rounded-xl space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-700">
                <span className="w-6 h-6 rounded-full bg-[#0D06B2]/10 text-[#0D06B2] flex items-center justify-center font-bold text-xs">1</span>
                Secure Google Authentication (clients)
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-700">
                <span className="w-6 h-6 rounded-full bg-[#0D06B2]/10 text-[#0D06B2] flex items-center justify-center font-bold text-xs">2</span>
                Admin CRM for the authorized Firebase account
              </div>
            </div>

            <button
              onClick={async () => {
                await onLogin();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-[#050505] text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-xl group"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.5h6.104c-.27 1.488-1.742 4.368-6.104 4.368-3.674 0-6.664-3.042-6.664-6.793s2.99-6.793 6.664-6.793c2.08 0 3.475.888 4.276 1.644l3.248-3.144C17.65 2.128 15.176 1 12.24 1 6.388 1 1.6 5.788 1.6 11.64s4.788 10.64 10.64 10.64c6.14 0 10.212-4.32 10.212-10.4 0-.72-.076-1.272-.172-1.596H12.24z" />
              </svg>
              Continue with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
