import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccessToast: (msg: string) => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccessToast,
}) => {
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [projectType, setProjectType] = useState('Web Development');
  const [budget, setBudget] = useState('$5k - $15k');
  const [idea, setIdea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !idea) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const inquiryData = {
        uid: user?.uid ?? null,
        name,
        email,
        phone,
        website,
        projectType,
        budget,
        idea,
        status: 'NEW',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const inquiryRef = await addDoc(collection(db, 'inquiries'), inquiryData);
      console.info('Inquiry submitted successfully:', inquiryRef.id);
      setSubmitted(true);
      onSuccessToast('Request submitted successfully. Our engineering team will review it shortly.');
    } catch (error) {
      console.error('Failed to submit inquiry to Firestore:', error);
      setSubmitError('We could not send your request. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#F7F5F2] border border-[#050505]/20 shadow-2xl rounded-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto text-[#050505]">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors text-neutral-600 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-12 space-y-6">
            <div className="w-16 h-16 bg-[#FF3131]/10 text-[#FF3131] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold tracking-wider text-[#FF3131] uppercase">
                RAN4कॉड / SUCCESS
              </span>
              <h3 className="text-3xl font-bold tracking-tight">Request Received</h3>
              <p className="text-neutral-600 max-w-md mx-auto text-sm">
                We've received your project details. Our engineers are reviewing your requirements and will reach out within 24 hours.
              </p>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="py-3 px-8 bg-[#050505] text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors shadow-lg"
            >
              Back to Website
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <span className="text-xs font-mono font-semibold tracking-wider text-[#FF3131] uppercase bg-[#FF3131]/10 px-3 py-1 rounded-md">
                RAN4कॉड / INQUIRY
              </span>
              <h2 className="text-3xl font-bold tracking-tight mt-3">Tell us what you're building.</h2>
              <p className="text-neutral-600 text-sm mt-1">
                {user ? `Submitting as ${user.email}` : 'Share your details and our team will follow up by email.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#050505] text-sm"
                      placeholder="Aditya Thakur"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#050505] text-sm"
                      placeholder="aditya@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#050505] text-sm"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Existing Website (optional)
                    </label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#050505] text-sm"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Project Type *
                    </label>
                    <select
                      value={projectType}
                      onChange={(e) => setProjectType(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#050505] text-sm"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Business Solutions">Business Solutions</option>
                      <option value="Brand Development">Brand Development</option>
                      <option value="Digital Strategy">Digital Strategy</option>
                      <option value="Software Solutions">Software Solutions</option>
                      <option value="Growth Support">Growth Support</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                      Estimated Budget
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#050505] text-sm"
                    >
                      <option value="$3k - $5k">$3k - $5k</option>
                      <option value="$5k - $15k">$5k - $15k</option>
                      <option value="$15k - $30k">$15k - $30k</option>
                      <option value="$30k+">$30k+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Project Idea / Requirements *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-[#050505] text-sm"
                    placeholder="Describe your business goals, current bottlenecks, and what you want RAN4कॉड to build..."
                  />
                </div>

                {submitError && <p role="alert" className="text-sm text-red-700">{submitError}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#FF3131] text-white rounded-xl font-medium hover:bg-[#e02828] transition-colors shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Submitting Request...' : 'Send Request →'}
                </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
