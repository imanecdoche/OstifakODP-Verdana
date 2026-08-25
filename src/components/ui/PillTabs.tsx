import React, { useRef, useEffect, useState } from 'react';

export interface TabOption<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface PillTabsProps<T extends string> {
  tabs: TabOption<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}

export function PillTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: PillTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [cues, setCues] = useState({ left: false, right: false });

  // Auto-center the active tab: order stays fixed, only the scroll focus moves
  useEffect(() => {
    const container = containerRef.current;
    const btn = buttonsRef.current.get(activeTab);
    if (!container || !btn) return;
    const targetLeft = btn.offsetLeft - (container.clientWidth - btn.offsetWidth) / 2;
    container.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
  }, [activeTab, tabs.length]);

  // Track scroll bounds for edge fade cues
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setCues({
        left: el.scrollLeft > 4,
        right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
      });
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [tabs]);

  const buildMask = () => {
    if (!cues.left && !cues.right) return undefined;
    const parts: string[] = [];
    if (cues.left) parts.push('transparent 0px', 'black 32px');
    if (cues.right) parts.push('black calc(100% - 32px)', 'transparent 100%');
    const gradient = `linear-gradient(to right, ${parts.join(', ')})`;
    return { maskImage: gradient, WebkitMaskImage: gradient };
  };

  return (
    <div
      ref={containerRef}
      style={buildMask()}
      className={`inline-flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-md border border-[#E2E8F0] overflow-x-auto max-w-full no-scrollbar ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) buttonsRef.current.set(tab.id, el);
              else buttonsRef.current.delete(tab.id);
            }}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-2 h-8 px-3.5 rounded-[4px] text-xs font-medium uppercase tracking-[0.5px] transition-all duration-160 ease-out whitespace-nowrap cursor-pointer active:scale-[0.97] select-none ${
              isActive
                ? 'bg-[#0F172A] text-white font-semibold shadow-[0_1px_3px_rgba(15,23,42,0.12)]'
                : 'bg-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-[2px] ${
                  isActive
                    ? 'bg-white/20 text-white font-bold'
                    : 'bg-[#E2E8F0] text-[#64748B]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
