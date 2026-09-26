import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronDown, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface HeroProps {
  onOpenRequest: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRequest }) => {
  const [heroTitle, setHeroTitle] = useState('BUILD. DEVELOP. GROW.');
  const [heroSubtitle, setHeroSubtitle] = useState(
    'We turn ideas into real digital systems — from strategy and design to development, launch, and growth.'
  );

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'main'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.heroTitle) setHeroTitle(data.heroTitle);
          if (data.heroSubtitle) setHeroSubtitle(data.heroSubtitle);
        }
      } catch (e) {
        // Fallback silently if offline or unavailable
      }
    };
    fetchCms();
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-[#070420] text-white border-b border-white/10">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-4xl">
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase bg-[#0D06B2]/50 border border-white/15 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-['Space_Grotesk',sans-serif]">runfourcode</span> / BUSINESS & DEVELOPMENT
          </div>

          {/* Oversized Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-white font-['Space_Grotesk',sans-serif] leading-[0.95] mb-8">
            {heroTitle.includes('.') ? (
              <>
                {heroTitle.split('.')[0]}.
                <br />
                {heroTitle.split('.')[1]?.trim()}.
                <br />
                <span className="text-[#0D06B2] drop-shadow-[0_0_25px_rgba(13,6,178,0.8)] text-cyan-400">
                  {heroTitle.split('.')[2]?.trim() || 'GROW.'}
                </span>
              </>
            ) : (
              heroTitle
            )}
          </h1>

          {/* Supporting Copy */}
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl font-['DM_Sans',sans-serif] leading-relaxed mb-10">
            {heroSubtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16">
            <button
              onClick={onOpenRequest}
              className="px-8 py-4 bg-[#0D06B2] text-white rounded-2xl font-medium text-base hover:bg-[#0a0490] transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group border border-white/20"
            >
              <span>Request Your Site</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#services"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-medium text-base hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore What We Build</span>
              <ChevronDown className="w-4 h-4 text-neutral-300" />
            </a>
          </div>

          {/* Visual Philosophy Pipeline */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'IDEA', desc: 'The starting spark' },
              { step: '02', title: 'STRATEGY', desc: 'Blueprint & roadmap' },
              { step: '03', title: 'SYSTEM', desc: 'Architecture & code' },
              { step: '04', title: 'PRODUCT', desc: 'Polished execution' },
              { step: '05', title: 'GROWTH', desc: 'Scale & optimization' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                <span className="text-[11px] font-mono font-bold text-cyan-400 block mb-1">
                  {item.step}
                </span>
                <h4 className="font-bold text-sm font-['Space_Grotesk',sans-serif] text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
