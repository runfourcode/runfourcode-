import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle2,
  Send,
  User as UserIcon,
  Globe,
  DollarSign,
  Smartphone,
  Monitor,
  LayoutDashboard,
  Inbox,
  Edit3,
  Save,
  FileText,
  Settings,
  Link as LinkIcon
} from 'lucide-react';
import { User } from '@firebase/auth';
import { apiRequest } from '../api';
import { Inquiry, ChatMessage, SiteContent } from '../types';

interface AdminPanelProps {
  user: User | null;
  adminEmail: string;
  onBackToHome: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, adminEmail, onBackToHome }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'inquiries' | 'cms' | 'ai-agent'>('inquiries');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [deployedUrlInput, setDeployedUrlInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [inquiryLoadError, setInquiryLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI Code Medic Agent state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Hello Admin. I am your internal runfourcode AI Code Medic & Debugger agent powered by Gemini 2.5 Flash. I can analyze runtime logs, diagnose backend errors, and generate automated code patches. How can I help optimize your platform today?' }
  ]);

  // CMS state
  const [siteContent, setSiteContent] = useState<SiteContent>({
    heroTitle: 'BUILD. DEVELOP. GROW.',
    heroSubtitle: 'We turn ideas into real digital systems — from strategy and design to development, launch, and continuous growth.',
    positioningHeadline: 'Your idea is only the beginning.',
    positioningBody: 'Ideas are easy. Building systems that actually work, scale under load, and solve real organizational problems is the real work.',
    services: [],
  });
  const [savingCms, setSavingCms] = useState(false);

  useEffect(() => {
    let active = true;
    const loadInquiries = async () => {
      try {
        const list = await apiRequest<Inquiry[]>('/api/inquiries');
        if (!active) return;
        setInquiries(list);
        setInquiryLoadError(null);
        setSelectedInquiryId((currentId) => currentId ?? list[0]?.id ?? null);
      } catch (error) {
        if (!active) return;
        console.error('Failed to load admin inquiries:', error);
        setInquiryLoadError(error instanceof Error ? error.message : 'Could not load inquiries.');
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
  }, []);

  const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId);

  useEffect(() => {
    if (selectedInquiry) {
      setDeployedUrlInput(selectedInquiry.deployedUrl || '');
    }
  }, [selectedInquiryId]);

  // Fetch site content for CMS
  useEffect(() => {
    const fetchCms = async () => {
      try {
        setSiteContent(await apiRequest<SiteContent>('/api/site-content'));
      } catch (error) {
        console.error('Failed to load website content:', error);
      }
    };
    void fetchCms();
  }, []);

  // Fetch messages for selected inquiry
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
        if (active) console.error('Failed to load inquiry messages:', error);
      }
    };
    void loadMessages();
    const interval = window.setInterval(loadMessages, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [selectedInquiryId]);

  const handleUpdateStatus = async (newStatus: 'NEW' | 'REPLIED' | 'IN PROGRESS' | 'CLOSED') => {
    if (!selectedInquiryId) return;
    try {
      const updated = await apiRequest<Inquiry>(`/api/inquiries/${selectedInquiryId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setInquiries((current) => current.map((inquiry) => inquiry.id === updated.id ? updated : inquiry));
    } catch (error) {
      console.error('Failed to update inquiry status:', error);
      alert(error instanceof Error ? error.message : 'Could not update inquiry status.');
    }
  };

  const handleSaveDeployedUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId) return;
    try {
      const updated = await apiRequest<Inquiry>(`/api/inquiries/${selectedInquiryId}`, {
        method: 'PATCH',
        body: JSON.stringify({ deployedUrl: deployedUrlInput.trim() }),
      });
      setInquiries((current) => current.map((inquiry) => inquiry.id === updated.id ? updated : inquiry));
      alert('Delivered website URL updated and sent to client dashboard successfully!');
    } catch (error) {
      console.error('Failed to update delivered website URL:', error);
      alert(error instanceof Error ? error.message : 'Could not update website URL.');
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedInquiryId) return;

    setSending(true);
    try {
      const message = await apiRequest<ChatMessage>(`/api/inquiries/${selectedInquiryId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message: replyMessage.trim() }),
      });
      setMessages((current) => [...current, message]);

      if (selectedInquiry?.status === 'NEW') {
        setInquiries((current) => current.map((inquiry) => inquiry.id === selectedInquiryId
          ? { ...inquiry, status: 'REPLIED', updatedAt: message.createdAt }
          : inquiry));
      }

      setReplyMessage('');
    } catch (error) {
      console.error('Failed to send admin reply:', error);
      alert(error instanceof Error ? error.message : 'Could not send reply.');
    } finally {
      setSending(false);
    }
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCms(true);
    try {
      await apiRequest('/api/site-content', {
        method: 'PUT',
        body: JSON.stringify(siteContent),
      });
      alert('Website content updated successfully across the platform!');
    } catch (error) {
      console.error('Error saving CMS:', error);
      alert(error instanceof Error ? error.message : 'Failed to save website content.');
    } finally {
      setSavingCms(false);
    }
  };

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;
    const promptText = aiPrompt;
    setAiPrompt('');
    setAiChatHistory(prev => [...prev, { role: 'user', text: promptText }]);
    setAiLoading(true);

    try {
      const data = await apiRequest<{ success: boolean; analysis: string }>('/api/ai-debugger', {
        method: 'POST',
        body: JSON.stringify({
          prompt: promptText,
          logs: { totalInquiries: inquiries.length, adminUser: user?.email || adminEmail }
        })
      });
      if (data.success) {
        setAiChatHistory(prev => [...prev, { role: 'assistant', text: data.analysis }]);
      } else {
        setAiChatHistory(prev => [...prev, { role: 'assistant', text: 'The AI agent returned no analysis.' }]);
      }
    } catch (err: any) {
      setAiChatHistory(prev => [...prev, { role: 'assistant', text: `Failed to communicate with AI agent: ${err.message}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.projectType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#070420] text-white flex flex-col items-center justify-center p-0 md:p-6">
      {/* Top Bar */}
      <div className="w-full max-w-7xl flex items-center justify-between px-6 py-4 bg-[#0D06B2] border-b border-white/15 md:rounded-t-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-sm font-bold font-['Space_Grotesk',sans-serif]">
              runfourcode ADMIN COMMAND CENTER
            </span>
            <p className="text-[11px] font-mono text-cyan-300">AUTHORIZED ADMIN: {user?.email || adminEmail || 'Authenticated'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveAdminTab('inquiries')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
                activeAdminTab === 'inquiries' ? 'bg-white text-[#0D06B2]' : 'text-white hover:text-cyan-300'
              }`}
            >
              Lead Inbox & Chat ({inquiries.length})
            </button>
            <button
              onClick={() => setActiveAdminTab('cms')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors ${
                activeAdminTab === 'cms' ? 'bg-white text-[#0D06B2]' : 'text-white hover:text-cyan-300'
              }`}
            >
              Website CMS Control
            </button>
            <button
              onClick={() => setActiveAdminTab('ai-agent')}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                activeAdminTab === 'ai-agent' ? 'bg-cyan-400 text-black' : 'text-white hover:text-cyan-300'
              }`}
            >
              <span>🤖 AI Code Medic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl h-[850px] bg-[#0E0935] border border-[#1C1268] shadow-2xl md:rounded-b-2xl overflow-hidden flex flex-col">
        {activeAdminTab === 'ai-agent' ? (
          <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-[#070420] flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-[#0E0935] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div>
                  <h2 className="text-xl font-bold font-['Space_Grotesk',sans-serif] flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span> runfourcode AI Code Medic & Debugger
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Internal AI agent powered by Gemini 2.5 Flash to inspect code, diagnose errors, and generate automated patches.
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 max-h-[500px]">
                {aiChatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] font-mono text-neutral-400 mb-1">
                      {msg.role === 'user' ? 'Admin' : 'runfourcode AI Agent'}
                    </span>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed max-w-2xl ${
                        msg.role === 'user'
                          ? 'bg-[#0D06B2] text-white rounded-br-none'
                          : 'bg-white/10 border border-white/15 text-neutral-200 rounded-bl-none font-mono text-xs whitespace-pre-wrap'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> AI Agent is analyzing codebase & diagnosing error...
                  </div>
                )}
              </div>

              <form onSubmit={handleAskAi} className="flex gap-3">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask the AI agent to diagnose a backend issue or help with a feature..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-400 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="px-6 py-3 bg-[#0D06B2] text-white rounded-xl text-xs font-bold hover:bg-[#0a0490] transition-colors border border-white/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <span>Ask AI Agent</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ) : activeAdminTab === 'cms' ? (
          <div className="flex-1 p-8 overflow-y-auto space-y-8 bg-[#070420]">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold font-['Space_Grotesk',sans-serif]">Website Content Management (CMS)</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Any change you make here updates the live website instantly for all visitors.
                  </p>
                </div>
                <button
                  onClick={handleSaveCms}
                  disabled={savingCms}
                  className="flex items-center gap-2 py-3 px-6 bg-[#0D06B2] hover:bg-[#0a0490] text-white rounded-xl text-xs font-bold transition-colors shadow-lg border border-white/20 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {savingCms ? 'Saving Changes...' : 'Save Live Changes'}
                </button>
              </div>

              <form onSubmit={handleSaveCms} className="space-y-6">
                <div className="p-6 bg-[#0E0935] border border-white/10 rounded-2xl space-y-4">
                  <h3 className="text-sm font-mono text-cyan-400 uppercase font-bold">Hero Section Controls</h3>
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">Hero Title</label>
                    <input
                      type="text"
                      value={siteContent.heroTitle}
                      onChange={(e) => setSiteContent({ ...siteContent, heroTitle: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">Hero Subtitle / Copy</label>
                    <textarea
                      rows={3}
                      value={siteContent.heroSubtitle}
                      onChange={(e) => setSiteContent({ ...siteContent, heroSubtitle: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="p-6 bg-[#0E0935] border border-white/10 rounded-2xl space-y-4">
                  <h3 className="text-sm font-mono text-cyan-400 uppercase font-bold">Core Philosophy & Positioning</h3>
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">Positioning Headline</label>
                    <input
                      type="text"
                      value={siteContent.positioningHeadline}
                      onChange={(e) => setSiteContent({ ...siteContent, positioningHeadline: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">Positioning Body</label>
                    <textarea
                      rows={3}
                      value={siteContent.positioningBody}
                      onChange={(e) => setSiteContent({ ...siteContent, positioningBody: e.target.value })}
                      className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
            {/* Left Inbox */}
            <div className="w-full md:w-80 bg-[#0A062C] border-r border-[#1C1268] flex flex-col h-full shrink-0">
              <div className="p-4 border-b border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-400 uppercase">LEAD INBOX</span>
                  <span className="text-xs font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">
                    {inquiries.length} LEADS
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search inquiries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono">
                  {['ALL', 'NEW', 'REPLIED', 'IN PROGRESS', 'CLOSED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                        statusFilter === st ? 'bg-[#0D06B2] text-white font-bold border border-white/20' : 'bg-black/30 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                {loading ? (
                  <div className="p-8 text-center text-xs text-neutral-400">Loading inbox...</div>
                ) : inquiryLoadError ? (
                  <div role="alert" className="p-8 text-center text-xs text-red-300">{inquiryLoadError}</div>
                ) : filteredInquiries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-400">No inquiries found.</div>
                ) : (
                  filteredInquiries.map((inq) => {
                    const isSelected = inq.id === selectedInquiryId;
                    return (
                      <button
                        key={inq.id}
                        onClick={() => setSelectedInquiryId(inq.id)}
                        className={`w-full text-left p-4 transition-colors flex flex-col gap-1.5 ${
                          isSelected ? 'bg-[#140C50] border-l-4 border-cyan-400' : 'hover:bg-black/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs truncate max-w-[160px] text-white">{inq.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              inq.status === 'NEW'
                                ? 'bg-cyan-500/20 text-cyan-300'
                                : inq.status === 'IN PROGRESS'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-300 truncate">{inq.projectType}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Chat & Details */}
            <div className="flex-1 flex flex-col h-full bg-[#0E0935]">
              {selectedInquiry ? (
                <>
                  <div className="p-4 bg-[#0A062C] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{selectedInquiry.name}</h3>
                        <span className="text-xs font-mono text-neutral-400">({selectedInquiry.email})</span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Type: <span className="text-white font-medium">{selectedInquiry.projectType}</span> • Budget:{' '}
                        <span className="text-white font-medium">{selectedInquiry.budget || 'N/A'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedInquiry.status}
                        onChange={(e) => handleUpdateStatus(e.target.value as any)}
                        className="bg-black/40 text-white text-xs font-mono border border-white/20 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="NEW" className="bg-[#0E0935]">NEW</option>
                        <option value="REPLIED" className="bg-[#0E0935]">REPLIED</option>
                        <option value="IN PROGRESS" className="bg-[#0E0935]">IN PROGRESS</option>
                        <option value="CLOSED" className="bg-[#0E0935]">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  {/* Delivered Website URL Sender */}
                  <form onSubmit={handleSaveDeployedUrl} className="p-3 bg-[#0A062C]/70 border-b border-white/10 flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <input
                        type="url"
                        placeholder="Enter delivered website URL (e.g. https://client-site.netlify.app)..."
                        value={deployedUrlInput}
                        onChange={(e) => setDeployedUrlInput(e.target.value)}
                        className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-[#0D06B2] hover:bg-[#0a0490] text-white rounded-xl text-xs font-bold transition-colors border border-white/20 shrink-0"
                    >
                      Send URL to Client
                    </button>
                  </form>

                  <div className="p-4 bg-[#0A062C]/50 border-b border-white/10 text-xs text-neutral-200">
                    <span className="font-mono text-[10px] text-cyan-400 uppercase block mb-1">Project Idea:</span>
                    <p className="leading-relaxed">{selectedInquiry.idea}</p>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#070420]">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-xs text-neutral-500">
                        No chat messages yet. Send a reply below.
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isAdminMsg = msg.senderType === 'admin';
                        return (
                          <div key={msg.id} className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`max-w-[85%] p-3 rounded-xl text-xs ${
                                isAdminMsg
                                  ? 'bg-[#0D06B2] text-white rounded-br-none border border-white/20'
                                  : 'bg-black/40 text-neutral-200 border border-white/15 rounded-bl-none'
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-1 opacity-70 text-[10px] font-mono">
                                <span>{isAdminMsg ? 'runfourcode Admin' : selectedInquiry.name}</span>
                              </div>
                              <p className="leading-relaxed">{msg.message}</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendAdminReply} className="p-3 bg-[#0A062C] border-t border-white/10 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type admin reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      disabled={sending || !replyMessage.trim()}
                      className="p-2.5 bg-[#0D06B2] text-white rounded-xl hover:bg-[#0a0490] transition-colors disabled:opacity-50 border border-white/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-neutral-400 text-xs">
                  Select a lead from the inbox.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
