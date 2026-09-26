import React from 'react';

export const ProcessSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'DISCOVER',
      subtitle: 'Understand the business, problem, audience, and goals.',
      desc: 'We dive deep into your organization to map out operational bottlenecks, target user requirements, and exact success metrics before writing a single line of code.',
    },
    {
      num: '02',
      title: 'PLAN',
      subtitle: 'Define the strategy, scope, structure, and roadmap.',
      desc: 'We establish the architectural blueprint, technical stack, wireframes, and phased milestone roadmap so everyone is aligned on deliverables and timeline.',
    },
    {
      num: '03',
      title: 'BUILD',
      subtitle: 'Design, develop, integrate, and test.',
      desc: 'Our engineers build your digital system with rigorous code standards, responsive UI, secure Firestore databases, and thorough quality assurance testing.',
    },
    {
      num: '04',
      title: 'GROW',
      subtitle: 'Launch, optimize, support, and improve.',
      desc: 'We deploy to production, verify SEO and performance, and provide continuous optimization, maintenance, and feature enhancements as your business scales.',
    },
  ];

  return (
    <section id="process" className="py-24 md:py-36 bg-[#070420] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-3xl mb-20">
          <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase block mb-3">
            RAN4कॉड / METHODOLOGY
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif] mb-6">
            FROM IDEA TO SYSTEM
          </h2>
          <p className="text-neutral-300 text-lg leading-relaxed">
            A predictable, transparent four-step engineering process that ensures every project is delivered on time, on budget, and built to last.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-8 bg-[#0E0935] border border-white/10 rounded-3xl flex flex-col justify-between relative hover:border-cyan-400 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm font-mono font-bold text-white bg-[#0D06B2] border border-white/20 px-3 py-1.5 rounded-xl">
                    {step.num}
                  </span>
                  <span className="text-xs font-mono text-cyan-300 font-semibold">STAGE {step.num}</span>
                </div>
                <h3 className="text-2xl font-bold font-['Space_Grotesk',sans-serif] text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs font-semibold text-cyan-300 mb-4">{step.subtitle}</p>
                <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono text-neutral-500">
                <span>RAN4CODE</span>
                <span>STEP {step.num} / 04</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
