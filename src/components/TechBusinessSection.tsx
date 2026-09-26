import React from 'react';
import { Cpu, Target, ShieldCheck, Zap } from 'lucide-react';

export const TechBusinessSection: React.FC = () => {
  return (
    <section className="py-24 md:py-36 bg-[#050505] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono font-semibold tracking-wider text-[#FF3131] uppercase bg-[#FF3131]/10 px-3 py-1 rounded-md">
              RAN4कॉड / STRATEGY FIRST
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight font-['Space_Grotesk',sans-serif] leading-tight">
              Technology should solve a business problem.
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed">
              We don’t build digital products simply because technology exists. We start with your business objective, analyze your operational bottlenecks, and then design the exact system required to achieve measurable growth.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <Target className="w-8 h-8 text-[#FF3131] mb-4" />
              <h3 className="text-lg font-bold font-['Space_Grotesk',sans-serif] mb-2">Objective-Driven</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Every feature we engineer ties directly to revenue growth, cost reduction, or operational efficiency.
              </p>
            </div>
            <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <ShieldCheck className="w-8 h-8 text-[#FF3131] mb-4" />
              <h3 className="text-lg font-bold font-['Space_Grotesk',sans-serif] mb-2">Zero-Trust Security</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Enterprise-grade security rules and encrypted data storage safeguard your organization and client data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
