import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from '@firebase/auth';
import { auth, googleProvider } from './firebase';
import { apiRequest } from './api';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Positioning } from './components/Positioning';
import { WhoWeBuild } from './components/WhoWeBuild';
import { ServicesSection } from './components/ServicesSection';
import { ProcessSection } from './components/ProcessSection';
import { TechBusinessSection } from './components/TechBusinessSection';
import { WhatWeCanBuild } from './components/WhatWeCanBuild';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { RequestModal } from './components/RequestModal';
import { ChatWidget } from './components/ChatWidget';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ClientDashboard } from './views/ClientDashboard';
import { AdminPanel } from './views/AdminPanel';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'admin'>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    let active = true;
    const refreshSession = async () => {
      try {
        const session = await apiRequest<{ isAdmin: boolean; email: string | null }>('/api/session');
        if (!active) return;
        setIsAdmin(session.isAdmin);
        setAdminEmail(session.isAdmin ? session.email || '' : '');
      } catch {
        if (!active) return;
        setIsAdmin(false);
        setAdminEmail('');
      }
    };
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) return;
      setUser(firebaseUser);
      void refreshSession();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      const session = await apiRequest<{ isAdmin: boolean }>('/api/session');
      setIsAdmin(session.isAdmin);
      addToast(session.isAdmin ? 'Signed in successfully with the admin account.' : 'Signed in successfully with Google.');
    } catch (error) {
      console.error('Login error:', error);
      addToast('Authentication failed. Please try again.', 'error');
    }
  };

  const handleAdminLogin = async (email: string, password: string) => {
    try {
      const session = await apiRequest<{ isAdmin: boolean; email: string }>('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!session.isAdmin) {
        return false;
      }
      setIsAdmin(true);
      setAdminEmail(session.email);
      setCurrentView('admin');
      addToast('Admin signed in successfully.');
      return true;
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Admin sign-in failed.', 'error');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/admin/logout', { method: 'POST' }).catch(() => {});
      await signOut(auth).catch(() => {});
      setUser(null);
      setIsAdmin(false);
      setAdminEmail('');
      setCurrentView('home');
      addToast('Signed out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      addToast('Error signing out.', 'error');
    }
  };

  if (currentView === 'dashboard') {
    return (
      <>
        <ClientDashboard
          user={user}
          onLogout={handleLogout}
          onBackToHome={() => setCurrentView('home')}
          onOpenRequest={() => setRequestModalOpen(true)}
        />
        <RequestModal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          user={user}
          onSuccessToast={(msg) => addToast(msg)}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  if (currentView === 'admin') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-[#F7F5F2] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-neutral-300 p-8 rounded-3xl shadow-xl space-y-4">
            <h2 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-red-600">Access Denied</h2>
            <p className="text-sm text-neutral-600">
              The Admin Panel is restricted to the server-configured admin account.
            </p>
            <button
              onClick={() => setCurrentView('home')}
              className="py-3 px-6 bg-[#0D06B2] text-white rounded-xl text-xs font-medium hover:bg-[#0a0490]"
            >
              Return to Website
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <AdminPanel user={user} adminEmail={adminEmail} onBackToHome={() => setCurrentView('home')} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#050505] selection:bg-[#0D06B2] selection:text-white">
      <Navbar
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenRequest={() => setRequestModalOpen(true)}
        onOpenDashboard={() => setCurrentView('dashboard')}
        isAdmin={isAdmin}
        adminEmail={adminEmail}
        onOpenAdmin={() => setCurrentView('admin')}
      />

      <main>
        <Hero onOpenRequest={() => setRequestModalOpen(true)} />
        <Marquee />
        <Positioning />
        <WhoWeBuild />
        <ServicesSection onOpenRequest={() => setRequestModalOpen(true)} />
        <ProcessSection />
        <TechBusinessSection />
        <WhatWeCanBuild onOpenRequest={() => setRequestModalOpen(true)} />
      </main>

      <Footer onOpenRequest={() => setRequestModalOpen(true)} />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
        adminSessionEmail={adminEmail}
        onLogin={handleLogin}
        onAdminLogin={handleAdminLogin}
        onLogout={handleLogout}
        onOpenDashboard={() => setCurrentView('dashboard')}
        isAdmin={isAdmin}
        onOpenAdmin={() => setCurrentView('admin')}
      />

      <RequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        user={user}
        onSuccessToast={(msg) => addToast(msg)}
      />

      <ChatWidget user={user} onOpenAuth={() => setAuthModalOpen(true)} />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
