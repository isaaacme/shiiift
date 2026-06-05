import { useState, useMemo } from 'react';
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
  color: 'accent' | 'accent-2' | 'warm';
  category: 'leads' | 'ops' | 'ai' | 'strategy' | 'finance';
  component: React.ComponentType<{ t: any }>;
}

const TOOLS_LIST: ToolItem[] = [
  { id: 'business-audit', key: 'businessAudit', color: 'accent', category: 'strategy', component: BusinessAudit },
  { id: 'website-audit', key: 'websiteAudit', color: 'accent-2', category: 'leads', component: WebsiteAudit },
  { id: 'automation-finder', key: 'automationFinder', color: 'warm', category: 'ops', component: AutomationFinder },
  { id: 'ai-readiness', key: 'aiReadiness', color: 'accent', category: 'ai', component: AIReadiness },
  { id: 'tool-stack', key: 'toolStack', color: 'accent-2', category: 'ops', component: ToolStackSimplifier },
  { id: 'lead-flow', key: 'leadFlow', color: 'warm', category: 'leads', component: LeadFlowMapper },
  { id: 'pricing-calculator', key: 'pricingCalculator', color: 'accent', category: 'finance', component: PricingCalculator },
  { id: 'proposal-builder', key: 'proposalBuilder', color: 'accent-2', category: 'strategy', component: ProposalBuilder },
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

const colorMap = {
  accent: 'text-shift-accent border-shift-accent/20 bg-shift-accent/5',
  'accent-2': 'text-shift-accent-2 border-shift-accent-2/20 bg-shift-accent-2/5',
  warm: 'text-shift-warm border-shift-warm/20 bg-shift-warm/5',
};

const borderHoverMap = {
  accent: 'hover:shadow-[0_0_20px_rgba(199,255,74,0.06)] hover:border-shift-accent/35',
  'accent-2': 'hover:shadow-[0_0_20px_rgba(110,231,249,0.06)] hover:border-shift-accent-2/35',
  warm: 'hover:shadow-[0_0_20px_rgba(255,122,89,0.06)] hover:border-shift-warm/35',
};

const textHoverMap = {
  accent: 'group-hover:text-shift-accent',
  'accent-2': 'group-hover:text-shift-accent-2',
  warm: 'group-hover:text-shift-warm',
};

export default function OSConsole({ lang, t }: OSConsoleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  const isRtl = lang === 'he';

  const activeTool = useMemo(() => {
    return TOOLS_LIST.find((t) => t.id === activeToolId);
  }, [activeToolId]);

  const filteredTools = useMemo(() => {
    return TOOLS_LIST.filter((tool) => {
      const toolTrans = t.tools[tool.key];
      if (!toolTrans) return false;

      // Filter by category
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = toolTrans.title.toLowerCase().includes(query);
        const matchesDesc = toolTrans.desc.toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, t.tools]);

  const handleSelectTool = (id: string) => {
    setActiveToolId(id);
    // Scroll to console top
    const el = document.getElementById('os-console-wrapper');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBack = () => {
    setActiveToolId(null);
  };

  return (
    <div id="os-console-wrapper" className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-8">
      {/* Console Box */}
      <div className="relative rounded-2xl border border-white/10 bg-shift-bg/85 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300">
        
        {/* Console Header Frame */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            {/* Unix/OS window circles */}
            <span className="w-3 h-3 rounded-full bg-shift-warm/80"></span>
            <span className="w-3 h-3 rounded-full bg-shift-accent-2/80"></span>
            <span className="w-3 h-3 rounded-full bg-shift-accent/80"></span>
            <span className="font-mono text-xs text-shift-muted/50 ms-3 select-none">shiiift-os v1.0.4</span>
          </div>

          {activeTool && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-shift-muted hover:text-shift-text bg-white/[0.05] hover:bg-white/10 border border-white/5 transition-all cursor-pointer active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isRtl ? 'rotate-0' : 'rotate-180'}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {t.backToDashboard}
            </button>
          )}
        </div>

        {/* Dashboard Workspace */}
        <div className="p-6 md:p-8 min-h-[450px]">
          {activeTool ? (
            // Render Selected Active Tool inside OS console
            <div className="animate-fade-in">
              <div className="mb-8 border-b border-white/[0.06] pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-mono text-xs tracking-wider uppercase text-shift-accent">App</span>
                  <span className="font-mono text-xs text-shift-muted border border-white/10 px-2 py-0.5 rounded">
                    {t.tools[activeTool.key]?.time} {t.timeLabel}
                  </span>
                </div>
                <h1 className="font-heading font-bold text-2xl sm:text-3xl text-shift-text">
                  {t.tools[activeTool.key]?.title}
                </h1>
                <p className="text-sm text-shift-muted mt-2 max-w-3xl leading-relaxed">
                  {t.tools[activeTool.key]?.desc}
                </p>
              </div>

              {/* Dynamic instantiation of the react tool */}
              <activeTool.component t={t} />
            </div>
          ) : (
            // Render Dashboard View: Search + Filters + Grid
            <div className="space-y-6">
              
              {/* Search & Categories Bar */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-white/[0.06] pb-6">
                <div className="relative w-full md:max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/[0.04] text-shift-text placeholder-shift-muted/40 border border-white/10 outline-none focus:border-shift-accent-2/50 focus:ring-1 focus:ring-shift-accent-2/50 transition-all font-mono"
                  />
                  <div className="absolute left-3.5 top-3.5 text-shift-muted/30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                </div>

                {/* Categories Row */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-thin">
                  {Object.entries(t.categories).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap border ${
                        selectedCategory === key
                          ? 'bg-shift-accent-2/10 border-shift-accent-2/30 text-shift-accent-2'
                          : 'bg-transparent border-transparent text-shift-muted hover:text-shift-text hover:bg-white/[0.03]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTools.map((tool) => {
                  const toolTrans = t.tools[tool.key];
                  if (!toolTrans) return null;

                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool.id)}
                      className={`group flex flex-col text-start gap-4 p-5 rounded-xl border border-white/10 bg-white/[0.02] cursor-pointer transition-all duration-200 no-underline outline-none focus-visible:ring-2 focus-visible:ring-shift-accent-2 ${borderHoverMap[tool.color]}`}
                    >
                      <div className="flex items-start justify-between gap-2 w-full">
                        <h3 className={`font-heading font-semibold text-shift-text text-base leading-snug transition-colors ${textHoverMap[tool.color]}`}>
                          {toolTrans.title}
                        </h3>
                        <span className={`flex-shrink-0 font-mono text-[10px] px-2 py-0.5 rounded border ${colorMap[tool.color]}`}>
                          {toolTrans.time} {t.timeLabel}
                        </span>
                      </div>

                      <p className="text-xs text-shift-muted leading-relaxed flex-1">
                        {toolTrans.desc}
                      </p>

                      <div className="flex items-center justify-between w-full pt-3 border-t border-white/[0.05]">
                        <span className="text-[10px] font-mono text-shift-muted/70">
                          {t.outputLabel}: <span className="text-shift-text/80">{toolTrans.output}</span>
                        </span>
                        <span className={`flex items-center gap-1 font-mono text-[10px] transition-colors ${textHoverMap[tool.color]}`}>
                          {t.runTool}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={isRtl ? 'rotate-180' : ''}
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {filteredTools.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="font-mono text-sm text-shift-muted">No tools found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
