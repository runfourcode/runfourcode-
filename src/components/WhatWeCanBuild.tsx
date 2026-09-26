import React from 'react';
import { Layout, Globe, Server, Calendar, Cpu, Workflow, Smartphone, Shield } from 'lucide-react';

export const WhatWeCanBuild: React.FC<{ onOpenRequest: () => void }> = ({ onOpenRequest }) => {
  const items = [
    { icon: Globe, title: 'Business Websites', desc: 'High-converting, lightning-fast web presences that establish authority.' },
    { icon: Layout, title: 'Client Portals', desc: 'Secure customer hubs for project tracking, document sharing, and communication.' },
    { icon: Server, title: 'Internal Dashboards', desc: 'Custom data command centers to monitor operations, sales, and inventory.' },
    { icon: Calendar, title: 'Booking Systems', desc: 'Automated scheduling and reservation platforms tailored to your workflow.' },
    { icon: Cpu, title: 'Custom Platforms', desc: 'Purpose-built web applications engineered for unique business models.' },
    { icon: Workflow, title: 'Workflow Systems', desc: 'Automated multi-step pipelines connecting your software tools seamlessly.' },
    { icon: Smartphone, title: 'Digital Products', desc: 'Scalable web products and MVPs designed for rapid market testing and growth.' },
    { icon: Shield, title: 'Business Automation', desc: 'Custom scripts and webhook integrations eliminating manual data entry.' },
  ];

  return (
    <section id="capabilities" className="py-24 md:py-36 bg-[#0E0935] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase block mb-3">
              RAN4कॉड / SOLUTIONS CATALOG
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
              WHAT WE CAN BUILD
            </h2>
          </div>
          <p className="text-neutral-400 max-w-md text-sm leading-relaxed">
            From foundational business websites to complex multi-role enterprise platforms, we engineer systems tailored precisely to your operational needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-8 bg-[#070420] border border-white/10 rounded-2xl hover:border-cyan-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#0D06B2] text-white flex items-center justify-center mb-6 group-hover:bg-cyan-500 transition-colors border border-white/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-['Space_Grotesk',sans-serif] text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-500">RAN4CODE SYSTEM</span>
                  <button
                    onClick={onOpenRequest}
                    className="text-xs font-bold text-cyan-400 hover:underline inline-flex items-center gap-1"
                  >
                    Build This →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
