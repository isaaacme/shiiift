import { useState, useMemo, useEffect, useRef } from 'react';
import BusinessAudit from './BusinessAudit';
import WebsiteAudit from './WebsiteAudit';
import AutomationFinder from './AutomationFinder';
import AIReadiness from './AIReadiness';
import ToolStackSimplifier from './ToolStackSimplifier';
import LeadFlowMapper from './LeadFlowMapper';
import PricingCalculator from './PricingCalculator';
import ProposalBuilder from './ProposalBuilder';

type Lang = 'he' | 'en' | 'es' | 'ru';

interface ToolItem {
  id: string;
  key: string;
  emoji: string;
  category: 'leads' | 'ops' | 'ai' | 'strategy' | 'finance';
  component: React.ComponentType<{ t: any }>;
}

const TOOLS_LIST: ToolItem[] = [
  { id: 'business-audit',    key: 'businessAudit',    emoji: '🔍', category: 'strategy', component: BusinessAudit },
  { id: 'website-audit',     key: 'websiteAudit',     emoji: '🌐', category: 'leads',    component: WebsiteAudit },
  { id: 'automation-finder', key: 'automationFinder', emoji: '⚡', category: 'ops',      component: AutomationFinder },
  { id: 'ai-readiness',      key: 'aiReadiness',      emoji: '🤖', category: 'ai',       component: AIReadiness },
  { id: 'tool-stack',        key: 'toolStack',        emoji: '🧰', category: 'ops',      component: ToolStackSimplifier },
  { id: 'lead-flow',         key: 'leadFlow',         emoji: '📊', category: 'leads',    component: LeadFlowMapper },
  { id: 'pricing-calculator',key: 'pricingCalculator',emoji: '💰', category: 'finance',  component: PricingCalculator },
  { id: 'proposal-builder',  key: 'proposalBuilder',  emoji: '📄', category: 'strategy', component: ProposalBuilder },
];

interface OSConsoleProps {
  lang: Lang;
  t: {
    back: string;
    next: string;
    seeResults: string;
    startOver: string;
    yourScore: string;
    topFindings: string;
    quickWins: string;
    nextActions: string;
    relatedTools: string;
    newsletterTitle: string;
    newsletterPlaceholder: string;
    newsletterCta: string;
    newsletterDisclaimer: string;
    lang: string;

    searchPlaceholder: string;
    allTools: string;
    diagnosticTitle: string;
    diagnosticSubtitle: string;
    backToDashboard: string;
    runTool: string;
    timeLabel: string;
    outputLabel: string;

    categories: {
      all: string;
      leads: string;
      ops: string;
      ai: string;
      strategy: string;
      finance: string;
    };

    tools: Record<string, {
      title: string;
      desc: string;
      time: string;
      output: string;
    }>;
  };
}

export default function OSConsole({ lang, t }: OSConsoleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const isRtl = lang === 'he';
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on '/' if not typing in any input/textarea
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (!(document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement)) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }

      // Handle Escape to go back or clear search
      if (e.key === 'Escape') {
        if (activeToolId) {
          handleBack();
        } else if (document.activeElement === searchInputRef.current) {
          searchInputRef.current?.blur();
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeToolId, searchQuery]);

  const activeTool = useMemo(() => {
    return TOOLS_LIST.find((tool) => tool.id === activeToolId);
  }, [activeToolId]);

  const filteredTools = useMemo(() => {
    return TOOLS_LIST.filter((tool) => {
      const toolTrans = t.tools[tool.key];
      if (!toolTrans) return false;
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) return false;
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return toolTrans.title.toLowerCase().includes(query) || toolTrans.desc.toLowerCase().includes(query);
      }
      return true;
    });
  }, [selectedCategory, searchQuery, t.tools]);

  const handleSelectTool = (id: string) => {
    setActiveToolId(id);
    const el = document.getElementById('tools-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBack = () => setActiveToolId(null);

  return (
    <div id="os-console-wrapper" className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-8">

      {activeTool ? (
        /* ── ACTIVE TOOL VIEW ── */
        <div>
          {/* Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-8 text-sm text-[#6B6B6B] hover:text-[#1A1A18] transition-colors cursor-pointer bg-transparent border-0 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D7A5F] focus-visible:ring-offset-2 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isRtl ? '' : 'rotate-180'}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            {t.backToDashboard}
          </button>

          {/* Tool header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{activeTool.emoji}</span>
              <span className="text-xs font-mono text-[#6B6B6B] border border-[rgba(26,26,24,0.10)] px-2 py-0.5 rounded-md bg-white">
                {t.tools[activeTool.key]?.time} {t.timeLabel}
              </span>
            </div>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#1A1A18] mb-2">
              {t.tools[activeTool.key]?.title}
            </h2>
            <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-2xl">
              {t.tools[activeTool.key]?.desc}
            </p>
          </div>

          {/* Tool component */}
          <activeTool.component t={t} />
        </div>
      ) : (
        /* ── TOOL GRID VIEW ── */
        <div>
          {/* Search + filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-8">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full ps-9 pe-4 py-2 rounded-lg text-sm bg-white text-[#1A1A18] placeholder-[#6B6B6B]/50 border border-[rgba(26,26,24,0.12)] outline-none focus:border-[#3D7A5F] focus:ring-1 focus:ring-[#3D7A5F] transition-all"
              />
              <div className="absolute start-3 top-2.5 text-[#6B6B6B]/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.entries(t.categories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D7A5F] focus-visible:ring-offset-2 ${
                    selectedCategory === key
                      ? 'bg-[#1A1A18] text-white border-[#1A1A18]'
                      : 'bg-white text-[#6B6B6B] border-[rgba(26,26,24,0.12)] hover:border-[rgba(26,26,24,0.25)] hover:text-[#1A1A18]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tool cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredTools.map((tool) => {
              const toolTrans = t.tools[tool.key];
              if (!toolTrans) return null;

              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelectTool(tool.id)}
                  className="group flex flex-col text-start gap-3 p-5 rounded-xl border border-[rgba(26,26,24,0.10)] bg-white cursor-pointer transition-all duration-150 outline-none hover:border-[rgba(26,26,24,0.22)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#3D7A5F]"
                >
                  {/* Emoji */}
                  <span className="text-2xl leading-none">{tool.emoji}</span>

                  {/* Title */}
                  <h3 className="font-heading font-semibold text-[#1A1A18] text-sm leading-snug">
                    {toolTrans.title}
                  </h3>

                  {/* Desc */}
                  <p className="text-xs text-[#6B6B6B] leading-relaxed flex-1">
                    {toolTrans.desc}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between w-full pt-2 border-t border-[rgba(26,26,24,0.07)] mt-auto">
                    <span className="text-[11px] text-[#6B6B6B]">
                      {toolTrans.time} {t.timeLabel}
                    </span>
                    <span className="text-[11px] font-medium text-[#3D7A5F] group-hover:underline">
                      {t.runTool} →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-[#6B6B6B]">No tools match your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
