import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ServiceItem } from '../types';

export const ServicesSection: React.FC<{ onOpenRequest: () => void }> = ({ onOpenRequest }) => {
  const services: ServiceItem[] = [
    {
      id: 'web-dev',
      number: '01',
      title: 'WEB DEVELOPMENT',
      shortDesc: 'Modern, responsive websites and web experiences designed around business goals.',
      fullDesc: 'We engineer high-performance, responsive websites built with clean code, lightning-fast load times, semantic accessibility, and SEO-optimized architecture that converts visitors into customers.',
      deliverables: ['Custom React / Vite Frontends', 'High-Performance SSR / Static Output', 'SEO Structured Data & OpenGraph', 'WCAG AA Accessibility Compliance', 'Mobile-First Responsive Layouts'],
      icon: 'code',
    },
    {
      id: 'business-solutions',
      number: '02',
      title: 'BUSINESS SOLUTIONS',
      shortDesc: 'Digital systems, workflows, automation, and internal tools.',
      fullDesc: 'Eliminate manual bottlenecks and spreadsheet chaos with tailored internal dashboards, CRM tools, automated data flows, and secure business portals.',
      deliverables: ['Internal Operations Dashboards', 'Workflow & Zapier / Webhook Automations', 'Client Portals & Role-Based Access', 'Data Migration & Pipeline Sync', 'Custom Business Tooling'],
      icon: 'layers',
    },
    {
      id: 'brand-development',
      number: '03',
      title: 'BRAND DEVELOPMENT',
      shortDesc: 'Digital identity, visual direction, and consistent brand experiences.',
      fullDesc: 'Establish a distinctive, authoritative visual identity and cohesive brand language that communicates your expertise across every customer touchpoint.',
      deliverables: ['Visual Identity & Guidelines', 'Typography & Color Systems', 'Digital Asset Libraries', 'UI/UX Design Systems', 'Marketing Collateral Templates'],
      icon: 'palette',
    },
    {
      id: 'digital-strategy',
      number: '04',
      title: 'DIGITAL STRATEGY',
      shortDesc: 'Technology roadmaps that connect digital investments with business objectives.',
      fullDesc: 'Stop guessing which tools to adopt. We evaluate your current operations and design a step-by-step technology roadmap guaranteed to maximize ROI and efficiency.',
      deliverables: ['Technology Stack Audits', 'Architecture Blueprints', 'Phased Implementation Roadmaps', 'Security & Compliance Reviews', 'Cost-to-Value Optimization'],
      icon: 'compass',
    },
    {
      id: 'software-solutions',
      number: '05',
      title: 'SOFTWARE SOLUTIONS',
      shortDesc: 'Custom software products and digital platforms.',
      fullDesc: 'Turn complex product requirements into robust, scalable software platforms built with modern cloud infrastructure and rock-solid security rules.',
      deliverables: ['SaaS Product Engineering', 'Cloud Firestore / Backend Architecture', 'REST & GraphQL API Integration', 'Third-Party Service Connectors', 'Secure User Authentication'],
      icon: 'cpu',
    },
    {
      id: 'growth-support',
      number: '06',
      title: 'GROWTH SUPPORT',
      shortDesc: 'Continuous optimization, improvements, maintenance, and development support.',
      fullDesc: 'Technology is never finished. We provide ongoing engineering support, continuous performance tuning, security updates, and feature expansions as your business grows.',
      deliverables: ['Continuous Performance Monitoring', 'Monthly Feature Sprints', 'Security & Dependency Updates', 'Conversion Rate Optimization', 'Priority Engineering Support'],
      icon: 'trending',
    },
  ];

  const [selectedId, setSelectedId] = useState(services[0].id);
  const activeService = services.find((s) => s.id === selectedId) || services[0];

  return (
    <section id="services" className="py-24 md:py-36 bg-[#0E0935] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-xs font-mono font-semibold tracking-wider text-cyan-300 uppercase block mb-3">
              RAN4कॉड / CAPABILITIES
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
              WHAT WE BUILD
            </h2>
          </div>
          <p className="text-neutral-400 max-w-md text-sm leading-relaxed">
            Six focused disciplines designed to take your organization from initial strategy to fully scaled digital systems.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-3">
            {services.map((service) => {
              const isActive = service.id === selectedId;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedId(service.id)}
                  className={`w-full text-left p-6 rounded-2xl transition-all border flex items-center justify-between ${
                    isActive
                      ? 'bg-[#0D06B2] text-white border-white/30 shadow-xl'
                      : 'bg-[#070420] text-white border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                        isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-neutral-300'
                      }`}
                    >
                      {service.number}
                    </span>
                    <span className="font-bold font-['Space_Grotesk',sans-serif] text-base md:text-lg">
                      {service.title}
                    </span>
                  </div>
                  <span className={`transition-transform ${isActive ? 'translate-x-1 text-cyan-300' : 'text-neutral-500'}`}>
                    →
                  </span>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-7 bg-[#070420] border border-white/15 rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
              <span className="text-xs font-mono font-bold text-cyan-300 bg-[#0D06B2]/40 border border-white/15 px-3 py-1 rounded-md">
                DISCIPLINE {activeService.number}
              </span>
              <span className="text-xs font-mono text-neutral-400">RAN4CODE ARCHITECTURE</span>
            </div>

            <h3 className="text-3xl font-bold font-['Space_Grotesk',sans-serif] text-white mb-4">
              {activeService.title}
            </h3>
            <p className="text-neutral-300 text-base leading-relaxed mb-8">
              {activeService.fullDesc}
            </p>

            <div className="mb-8">
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                Key Deliverables & Capabilities:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeService.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-sm text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-neutral-400 font-medium">Ready to start this build?</span>
              <button
                onClick={onOpenRequest}
                className="py-3 px-6 bg-[#0D06B2] text-white rounded-xl text-xs font-medium hover:bg-[#0a0490] transition-colors shadow-md inline-flex items-center gap-2 border border-white/20"
              >
                Request This Service <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
