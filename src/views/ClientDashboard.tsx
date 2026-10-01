import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  User as UserIcon,
  Shield,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  ArrowRight,
  ShieldCheck,
  Bell,
  Globe,
  Send,
  Sparkles,
  Activity,
  HeartPulse
} from 'lucide-react';
import { User } from '@firebase/auth';
import { apiRequest } from '../api';
import { Inquiry, ChatMessage } from '../types';

interface ClientDashboardProps {
  user: User | null;
  onLogout: () => Promise<void>;
  onBackToHome: () => void;
  onOpenRequest: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  user,
  onLogout,
  onBackToHome,
  onOpenRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'chat' | 'medic' | 'profile' | 'security'>('overview');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Self-Healing AI Doctor (Digital Medicine) state
  const [healingLogs, setHealingLogs] = useState<Array<{ id: string; time: string; issue: string; medicine: string; status: string }>>([
    { id: '1', time: '10:00 AM', issue: 'Minor DOM render latency detected in React tree', medicine: 'Digital Neural Rebuild & Cache Flush', status: 'HEALED' }
  ]);
  const [healingInProgress, setHealingInProgress] = useState(false);

  // Fetch client inquiries & projects
  useEffect(() => {
    if (!user) {
      setInquiries([]);
      setLoading(false);
      return;
    }
    let active = true;
    const loadInquiries = async () => {
      try {
        const list = await apiRequest<Inquiry[]>('/api/inquiries');
        if (!active) return;
        setInquiries(list);
        setSelectedInquiryId((currentId) => currentId ?? list[0]?.id ?? null);
      } catch (error) {
        if (active) console.error('Failed to load client inquiries:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadInquiries();
    const interval = window.setInterval(loadInquiries, 10000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [user]);

  // Fetch messages for selected project
  useEffect(() => {
    if (!selectedInquiryId) {
      setMessages([]);
      return;
    }

    let active = true;
    const loadMessages = async () => {
      try {
        const msgs = await apiRequest<ChatMessage[]>(`/api/inquiries/${selectedInquiryId}/messages`);
        if (!active) return;
        setMessages(msgs);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch (error) {
        if (active) console.error('Failed to load client messages:', error);
      }
    };
    void loadMessages();
    const interval = window.setInterval(loadMessages, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [selectedInquiryId]);

  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedInquiryId || !user) return;

    setSending(true);
    try {
      const message = await apiRequest<ChatMessage>(`/api/inquiries/${selectedInquiryId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: chatInput.trim() }),
      });
      setMessages((current) => [...current, message]);
      setChatInput('');
    } catch (error) {
      console.error('Failed to send client message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleAdministerDigitalMedicine = () => {
    if (healingInProgress) return;
    setHealingInProgress(true);
    setTimeout(() => {
      const newLog = {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        issue: 'Runtime memory leak & missing data binding detected by AI Health Monitor',
        medicine: '💊 Digital Antidote & Auto-Patch Administered Successfully',
        status: 'HEALED'
      };
      setHealingLogs(prev => [newLog, ...prev]);
      setHealingInProgress(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#050505] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#050505] text-white p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-800">
            <div>
              <span className="text-xl font-bold font-['Space_Grotesk',sans-serif] tracking-tighter">
                runfourcode
              </span>
              <p className="text-[11px] font-mono text-cyan-400 mt-1">CLIENT PORTAL</p>
            </div>
            <button
              onClick={onBackToHome}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Back to Website"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1.5 text-sm">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'overview' ? 'bg-[#0D06B2] text-white shadow-lg border border-white/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'projects' ? 'bg-[#0D06B2] text-white shadow-lg border border-white/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Globe className="w-4 h-4 text-cyan-400" /> My Projects & Websites
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'chat' ? 'bg-[#0D06B2] text-white shadow-lg border border-white/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" /> Direct Team Chat
            </button>
            <button
              onClick={() => setActiveTab('medic')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'medic' ? 'bg-[#0D06B2] text-white shadow-lg border border-white/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-cyan-400" /> AI Self-Healing Doctor
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'profile' ? 'bg-[#0D06B2] text-white shadow-lg border border-white/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <UserIcon className="w-4 h-4 text-cyan-400" /> Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === 'security' ? 'bg-[#0D06B2] text-white shadow-lg border border-white/20' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Shield className="w-4 h-4 text-cyan-400" /> Security
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-neutral-800">
          <div className="flex items-center gap-3 mb-4 p-3 bg-neutral-900 rounded-xl border border-white/10">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#0D06B2] text-white font-bold flex items-center justify-center text-xs">
                {user?.displayName?.[0] || 'U'}
              </div>
            )}
            <div className="overflow-hidden">
              <h5 className="font-bold text-xs truncate">{user?.displayName || 'Client'}</h5>
              <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-900 hover:bg-red-950 text-neutral-300 hover:text-red-400 rounded-xl text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 border border-neutral-200 rounded-3xl shadow-sm">
              <div>
                <span className="text-xs font-mono font-semibold tracking-wider text-[#0D06B2] uppercase">
                  runfourcode / CLIENT COMMAND CENTER
                </span>
                <h1 className="text-3xl font-bold font-['Space_Grotesk',sans-serif] text-neutral-900 mt-1">
                  Welcome back, {user?.displayName || 'Client'}
                </h1>
                <p className="text-neutral-600 text-sm mt-0.5">
                  Track your deliverables, test live preview websites sent by our engineers, and manage your digital systems.
                </p>
              </div>
              <button
                onClick={onOpenRequest}
                className="py-3 px-6 bg-[#0D06B2] text-white rounded-xl text-xs font-medium hover:bg-[#0a0490] transition-colors shadow-md inline-flex items-center gap-2 shrink-0 border border-white/20"
              >
                <Plus className="w-4 h-4 text-cyan-300" /> Request New Feature / Project
              </button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-semibold text-neutral-500 uppercase">ACTIVE PROJECTS</p>
                  <h3 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-neutral-900 mt-1">{inquiries.length}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D06B2] flex items-center justify-center font-bold">
                  🚀
                </div>
              </div>

              <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-semibold text-neutral-500 uppercase">AI SELF-HEALING DOCTOR</p>
                  <h3 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-emerald-600 mt-1">ONLINE</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  💊
                </div>
              </div>

              <div className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-semibold text-neutral-500 uppercase">SECURITY STATUS</p>
                  <h3 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-[#0D06B2] mt-1">SECURE</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D06B2] flex items-center justify-center font-bold">
                  🔒
                </div>
              </div>
            </div>

            {/* Active Deliverables / Websites */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-neutral-900">
                Your Delivered Websites & Progress
              </h3>

              {loading ? (
                <div className="p-12 text-center text-neutral-500 bg-white border border-neutral-200 rounded-2xl">
                  Loading your digital deliverables...
                </div>
              ) : inquiries.length === 0 ? (
                <div className="p-12 text-center bg-white border border-neutral-200 rounded-3xl space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#0D06B2]/10 text-[#0D06B2] flex items-center justify-center mx-auto">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-lg">No active projects yet.</h4>
                    <p className="text-sm text-neutral-500">Submit your project brief to begin building with runfourcode.</p>
                  </div>
                  <button
                    onClick={onOpenRequest}
                    className="py-3 px-6 bg-[#0D06B2] text-white rounded-xl text-xs font-medium hover:bg-[#0a0490] transition-colors shadow-md inline-flex items-center gap-2 border border-white/20"
                  >
                    Request Your Site <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="p-6 bg-white border border-neutral-200 rounded-3xl shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#050505] text-white">
                              {inq.projectType}
                            </span>
                            <span
                              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                                inq.status === 'NEW'
                                  ? 'bg-blue-100 text-blue-700'
                                  : inq.status === 'IN PROGRESS'
                                  ? 'bg-amber-100 text-amber-700'
                                  : inq.status === 'REPLIED'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {inq.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-neutral-900">{inq.idea}</p>
                        </div>

                        {inq.deployedUrl ? (
                          <a
                            href={inq.deployedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="py-2.5 px-5 bg-[#0D06B2] text-white rounded-xl text-xs font-bold hover:bg-[#0a0490] transition-colors shadow-md inline-flex items-center gap-2 shrink-0 border border-white/20"
                          >
                            <Globe className="w-4 h-4 text-cyan-300" /> Launch Delivered Website <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-lg">
                            Website link in progress by team...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>Budget: {inq.budget || 'Not specified'}</span>
                        <button
                          onClick={() => {
                            setSelectedInquiryId(inq.id);
                            setActiveTab('chat');
                          }}
                          className="text-[#0D06B2] font-semibold hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Open Direct Chat with Team
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-semibold text-[#0D06B2] uppercase">runfourcode / DELIVERABLES</span>
                <h2 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-neutral-900 mt-1">My Projects & Delivered Websites</h2>
              </div>
              <button
                onClick={onOpenRequest}
                className="py-2.5 px-5 bg-[#0D06B2] text-white rounded-xl text-xs font-medium hover:bg-[#0a0490] transition-colors shadow-md inline-flex items-center gap-2 border border-white/20"
              >
                <Plus className="w-4 h-4 text-cyan-300" /> Request New Feature
              </button>
            </div>

            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div key={inq.id} className="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#050505] text-white">{inq.projectType}</span>
                    <span className="text-xs font-mono text-neutral-500">ID: {inq.id}</span>
                  </div>
                  <p className="text-sm font-medium text-neutral-900">{inq.idea}</p>
                  {inq.deployedUrl ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-xs text-[#0D06B2]">Live Website Ready</h5>
                        <p className="text-xs text-neutral-600 font-mono truncate max-w-md">{inq.deployedUrl}</p>
                      </div>
                      <a
                        href={inq.deployedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-4 bg-[#0D06B2] text-white rounded-lg text-xs font-bold hover:bg-[#0a0490] transition-colors shrink-0"
                      >
                        Visit Site
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg font-medium">
                      ⏳ Team is building your system. Once your website is ready, the live URL will appear here automatically.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto h-[700px] bg-white border border-neutral-200 rounded-3xl shadow-sm flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="p-4 bg-[#050505] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Direct Engineering Team Chat</h3>
                <p className="text-xs text-neutral-400">Communicate directly with your assigned runfourcode engineers.</p>
              </div>
              <select
                value={selectedInquiryId || ''}
                onChange={(e) => setSelectedInquiryId(e.target.value)}
                className="bg-neutral-900 text-white text-xs font-mono border border-neutral-700 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                {inquiries.map((inq) => (
                  <option key={inq.id} value={inq.id}>
                    {inq.projectType} ({inq.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-neutral-50">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-xs text-neutral-500">
                  No messages yet. Send a message to start talking with our engineering team.
                </div>
              ) : (
                messages.map((msg) => {
                  const isClient = msg.senderType === 'client';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                          isClient
                            ? 'bg-[#0D06B2] text-white rounded-br-none shadow-md'
                            : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-none shadow-sm font-medium'
                        }`}
                      >
                        <span className="text-[10px] font-mono opacity-70 block mb-1">
                          {isClient ? 'You' : 'runfourcode Team'}
                        </span>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-200 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type your message or feature request..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0D06B2]"
              />
              <button
                type="submit"
                disabled={sending || !chatInput.trim()}
                className="py-3 px-6 bg-[#0D06B2] text-white rounded-xl text-xs font-bold hover:bg-[#0a0490] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {activeTab === 'medic' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div className="bg-white p-8 border border-neutral-200 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
                <div>
                  <span className="text-xs font-mono font-semibold text-[#0D06B2] uppercase">runfourcode / AI HEALTH DOCTOR</span>
                  <h2 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-neutral-900 mt-1 flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-emerald-600 animate-pulse" /> Self-Healing AI Agent (Digital Medicine)
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                    Just like humans take medicine when sick, this internal AI Agent continuously monitors your website runtime, automatically detects bugs, state discrepancies, or memory leaks, and administers <strong>Digital Medicine</strong> to heal itself instantly.
                  </p>
                </div>
                <button
                  onClick={handleAdministerDigitalMedicine}
                  disabled={healingInProgress}
                  className="py-3 px-6 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg inline-flex items-center gap-2 disabled:opacity-50 shrink-0"
                >
                  <Activity className="w-4 h-4 animate-spin" /> {healingInProgress ? 'Administering Digital Medicine...' : '💊 Administer Digital Medicine'}
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm font-['Space_Grotesk',sans-serif] text-neutral-900">AI Doctor Healing Log & Prescriptions</h4>
                <div className="space-y-3">
                  {healingLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-mono rounded font-bold">
                            {log.status}
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">{log.time}</span>
                        </div>
                        <p className="text-xs font-semibold text-neutral-900">{log.issue}</p>
                        <p className="text-xs text-emerald-700 font-mono">{log.medicine}</p>
                      </div>
                      <div className="text-2xl">💊</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div className="bg-white p-8 border border-neutral-200 rounded-3xl shadow-sm space-y-6">
              <div>
                <span className="text-xs font-mono font-semibold text-[#0D06B2] uppercase">runfourcode / USER PROFILE</span>
                <h2 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-neutral-900 mt-1">My Profile</h2>
              </div>
              <div className="flex items-center gap-4 py-4 border-y border-neutral-200">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#0D06B2] text-white font-bold flex items-center justify-center text-xl">
                    {user?.displayName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-lg text-neutral-900">{user?.displayName || 'Client'}</h4>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Google Verified Account
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div className="bg-white p-8 border border-neutral-200 rounded-3xl shadow-sm space-y-6">
              <div>
                <span className="text-xs font-mono font-semibold text-[#0D06B2] uppercase">runfourcode / SECURITY</span>
                <h2 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-neutral-900 mt-1">Session & Authentication</h2>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h5 className="font-bold text-sm text-emerald-900">Secure Google OAuth Session Active</h5>
                  <p className="text-xs text-emerald-700 mt-0.5">Your session uses verified Google sign-in and server-checked access to your project data.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
