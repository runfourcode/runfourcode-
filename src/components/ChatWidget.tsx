import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { User } from 'firebase/auth';
import { ChatMessage, Inquiry } from '../types';

interface ChatWidgetProps {
  user: User | null;
  onOpenAuth: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ user, onOpenAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch client inquiries to chat under
  useEffect(() => {
    if (!user) {
      setInquiries([]);
      setSelectedInquiryId(null);
      return;
    }

    const q = query(collection(db, 'inquiries'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Inquiry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Inquiry;
          list.push({ ...data, id: docSnap.id });
        });
        setInquiries(list);
        if (list.length > 0 && !selectedInquiryId) {
          setSelectedInquiryId(list[0].id);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'inquiries');
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Fetch messages for selected inquiry
  useEffect(() => {
    if (!selectedInquiryId) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, `inquiries/${selectedInquiryId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });
        setMessages(msgs);
        scrollToBottom();
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `inquiries/${selectedInquiryId}/messages`);
      }
    );

    return () => unsubscribe();
  }, [selectedInquiryId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !selectedInquiryId) return;

    setSending(true);
    try {
      await addDoc(collection(db, `inquiries/${selectedInquiryId}/messages`), {
        senderId: user.uid,
        senderType: 'client',
        senderName: user.displayName || 'Client',
        message: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false,
      });
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `inquiries/${selectedInquiryId}/messages`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-5 py-3.5 bg-[#050505] text-white rounded-full shadow-2xl hover:bg-neutral-800 transition-all hover:scale-105 group font-medium text-sm"
          aria-label="Open Chat Support"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3131] animate-pulse"></span>
          <MessageSquare className="w-4 h-4 text-[#FF3131]" />
          <span>Chat Support</span>
        </button>
      ) : (
        <div className="w-[90vw] sm:w-[380px] h-[520px] bg-white border border-neutral-300 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200 text-[#050505]">
          {/* Header */}
          <div className="bg-[#050505] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FF3131] flex items-center justify-center font-bold text-sm">
                R4
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight">RAN4कॉड Support</h4>
                <p className="text-[11px] text-neutral-400">Direct Engineering Channel</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!user ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FF3131]/10 text-[#FF3131] flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold">Sign in to start chatting</h4>
                <p className="text-xs text-neutral-500">Connect securely with Google to talk with our engineering team.</p>
              </div>
              <button
                onClick={onOpenAuth}
                className="py-2.5 px-6 bg-[#050505] text-white rounded-xl text-xs font-medium hover:bg-neutral-800 transition-colors shadow-md"
              >
                Sign In with Google
              </button>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#FF3131]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold">No Active Inquiries</h4>
                <p className="text-xs text-neutral-500">Submit a project request first to open a direct chat thread with your engineers.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="py-2 px-4 bg-[#FF3131] text-white rounded-xl text-xs font-medium hover:bg-[#e02828] transition-colors"
              >
                Request Your Site
              </button>
            </div>
          ) : (
            <>
              {/* Inquiry Selector Bar if multiple */}
              {inquiries.length > 1 && (
                <div className="bg-neutral-100 p-2 border-b border-neutral-200">
                  <select
                    value={selectedInquiryId || ''}
                    onChange={(e) => setSelectedInquiryId(e.target.value)}
                    className="w-full text-xs bg-white border border-neutral-300 rounded-lg p-1.5 font-medium"
                  >
                    {inquiries.map((inq) => (
                      <option key={inq.id} value={inq.id}>
                        {inq.projectType} — {inq.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F5F2]/50">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-neutral-400 text-xs">
                    No messages yet. Send a message to start the conversation with your lead engineer.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isClient = msg.senderType === 'client';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                            isClient
                              ? 'bg-[#050505] text-white rounded-br-none'
                              : 'bg-white border border-neutral-300 text-neutral-900 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-1 mb-1 opacity-70 text-[10px]">
                            <span>{isClient ? 'You' : 'RAN4कॉड Engineer'}</span>
                          </div>
                          <p className="leading-relaxed">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3.5 py-2.5 bg-neutral-100 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-[#050505]"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-2.5 bg-[#FF3131] text-white rounded-xl hover:bg-[#e02828] transition-colors disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
