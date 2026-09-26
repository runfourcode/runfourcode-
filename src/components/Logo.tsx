import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-9" }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center bg-[#0D06B2] text-white px-3.5 py-2 rounded-xl shadow-md border border-white/10">
        <span className="font-['Space_Grotesk',sans-serif] font-bold text-lg tracking-tight flex items-center">
          <span className="text-white">runfourcode</span>
        </span>
      </div>
    </div>
  );
};
