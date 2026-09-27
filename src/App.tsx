import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
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

const ADMIN_EMAILS = [
  'aadityathakur.ayu243@gmail.com',
  'thakuradi8368@gmail.com',
  'ran4code@gmail.com',
  'admin@runfourcode.com',
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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

  // Admin access is tied to the authenticated Firebase account, not a client-side password.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const admin = ADMIN_EMAILS.includes(firebaseUser.email || '');
        setIsAdmin(admin);
        if (!admin) {
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (!userSnap.exists()) {
              await setDoc(userDocRef, {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || 'Client',
                email: firebaseUser.email || '',
                role: 'client',
                createdAt: serverTimestamp(),
              });
            }
          } catch (error) {
            console.error('Error fetching user role:', error);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (ADMIN_EMAILS.includes(res.user.email || '')) {
        setIsAdmin(true);
        addToast('Signed in successfully with the admin account.');
      } else {
        setIsAdmin(false);
        addToast('Signed in successfully with Google.');
      }
    } catch (error) {
      console.error('Login error:', error);
      addToast('Authentication failed. Please try again.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth).catch(() => {});
      setUser(null);
      setIsAdmin(false);
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
              The Admin Panel is restricted to authorized company accounts signed in through Firebase.
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
        <AdminPanel user={user} onBackToHome={() => setCurrentView('home')} />
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
        onLogin={handleLogin}
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
