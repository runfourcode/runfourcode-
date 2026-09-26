import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const Footer: React.FC<{ onOpenRequest: () => void }> = ({ onOpenRequest }) => {
  return (
    <footer className="bg-[#050505] text-white pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-neutral-800">
          <div className="md:col-span-6 space-y-4">
            <span className="text-2xl font-bold font-['Space_Grotesk',sans-serif] tracking-tighter">
              <span>runfourcode</span>
            </span>
            <p className="text-neutral-400 text-sm max-w-md leading-relaxed">
              Business & Development. We turn ideas into real digital systems — from strategy and design to development, launch, and growth.
            </p>
            <div className="pt-2">
              <span className="text-xs font-mono text-cyan-400">BUILD. DEVELOP. GROW.</span>
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">Navigation</h4>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-300">
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#who-we-build" className="hover:text-white transition-colors">Audience</a></li>
              <li><a href="#process" className="hover:text-white transition-colors">Process</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a></li>
              <li><a href="#philosophy" className="hover:text-white transition-colors">Philosophy</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400">Start a Project</h4>
            <p className="text-neutral-400 text-sm">Ready to build something extraordinary?</p>
            <button
              onClick={onOpenRequest}
              className="py-3 px-6 bg-[#0D06B2] text-white rounded-xl text-xs font-medium hover:bg-[#0a0490] transition-colors shadow-lg inline-flex items-center gap-2 border border-white/20"
            >
              Request Your Site <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} runfourcode. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Secure Client Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
