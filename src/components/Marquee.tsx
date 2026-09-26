import React from 'react';

export const Marquee: React.FC = () => {
  const items = [
    'WEB DEVELOPMENT',
    'BUSINESS SOLUTIONS',
    'BRAND DEVELOPMENT',
    'DIGITAL STRATEGY',
    'SOFTWARE SOLUTIONS',
    'GROWTH SUPPORT',
  ];

  return (
    <div className="py-6 bg-[#050505] text-white overflow-hidden whitespace-nowrap border-y border-[#333]">
      <div className="inline-flex animate-[marquee_25s_linear_infinite] items-center gap-8">
        {[...items, ...items, ...items, ...items].map((item, idx) => (
          <div key={idx} className="flex items-center gap-8 text-sm md:text-base font-mono tracking-widest font-semibold uppercase">
            <span className="hover:text-[#FF3131] transition-colors">{item}</span>
            <span className="text-[#FF3131]">•</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
