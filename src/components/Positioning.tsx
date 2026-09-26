import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const Positioning: React.FC = () => {
  const [headline, setHeadline] = useState('Your idea is only the beginning.');
  const [body, setBody] = useState(
    'Ideas are easy. Building systems that actually work, scale under load, and solve real organizational problems is the real work.'
  );

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const snap = await getDoc(doc(db, 'siteContent', 'main'));
        if (snap.exists()) {
          const data = snap.data();
          if (data.positioningHeadline) setHeadline(data.positioningHeadline);
          if (data.positioningBody) setBody(data.positioningBody);
        }
      } catch (e) {
        // Fallback silently if offline or unavailable
      }
    };
    fetchCms();
  }, []);

  return (
    <section id="philosophy" className="py-24 md:py-36 bg-[#0E0935] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-4xl">
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase block mb-4">
            runfourcode / CORE PHILOSOPHY
          </span>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif] leading-[1.05] mb-8">
            {headline}
          </h2>
          <p className="text-2xl md:text-3xl text-neutral-300 font-['DM_Sans',sans-serif] font-medium leading-snug mb-12">
            {body}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-white/10">
            <div>
              <h4 className="font-bold text-lg text-white font-['Space_Grotesk',sans-serif] mb-2">
                Engineering Over Noise
              </h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                We don’t chase fleeting design fads or superficial trends. We build rigorous digital foundations designed to outlast competition and adapt to market shifts.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg text-white font-['Space_Grotesk',sans-serif] mb-2">
                Partnership, Not Outsourcing
              </h4>
              <p className="text-neutral-400 text-sm leading-relaxed">
                When you partner with <span className="font-['Space_Grotesk',sans-serif] font-bold">runfourcode</span>, you gain a dedicated technology arm committed to your long-term business velocity and operational reliability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
