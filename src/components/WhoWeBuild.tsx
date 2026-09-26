import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const WhoWeBuild: React.FC = () => {
  const audiences = [
    {
      num: '01',
      title: 'STARTUPS',
      subtitle: 'Build the foundation.',
      desc: 'Move from prototype to production-ready platforms with reliable architecture designed to win your first 10,000 customers.',
    },
    {
      num: '02',
      title: 'SMALL BUSINESSES',
      subtitle: 'Upgrade the digital presence.',
      desc: 'Replace outdated websites and manual spreadsheets with modern, responsive web systems that generate inbound leads and automate workflows.',
    },
    {
      num: '03',
      title: 'GROWING COMPANIES',
      subtitle: 'Scale the systems.',
      desc: 'Refactor and expand existing software infrastructure to handle increased traffic, complex integrations, and team expansion.',
    },
    {
      num: '04',
      title: 'ORGANIZATIONS',
      subtitle: 'Create reliable digital experiences.',
      desc: 'Deploy secure, accessible, enterprise-grade web applications and internal portals that meet the highest standards of reliability and compliance.',
    },
  ];

  return (
    <section id="who-we-build" className="py-24 md:py-36 bg-[#070420] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase block mb-3">
              RAN4कॉड / AUDIENCE
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
              Who We Build For
            </h2>
          </div>
          <p className="text-neutral-400 max-w-md text-sm leading-relaxed">
            Organizations that value technical rigor, business alignment, and long-term digital reliability over quick fixes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {audiences.map((item, idx) => (
            <div
              key={idx}
              className="p-8 md:p-10 bg-[#0E0935] border border-white/10 rounded-2xl flex flex-col justify-between hover:border-cyan-400 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-mono font-bold text-cyan-300 bg-[#0D06B2]/40 border border-white/15 px-3 py-1 rounded-md">
                    {item.num}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h3 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm font-medium text-cyan-300 mb-4">{item.subtitle}</p>
                <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
