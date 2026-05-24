import { useState, useEffect } from 'react';
import { trackEvent } from './useToolSession';
import { saveNewsletterSignup, saveToolResult } from '../../lib/supabase';

type Lang = 'he' | 'en' | 'es' | 'ru';

function gl(o: Record<string, string>, l: string): string {
  return o[l] ?? o['en'] ?? '';
}

interface RelatedTool {
  href: string;
  label: Record<string, string>;
}

interface RelatedArticle {
  href: string;
  label: Record<string, string>;
  category: Record<string, string>;
}

function computeSmartTools(toolId: string, answers: Record<string, unknown>, lang: Lang): RelatedTool[] {
  const base = DEFAULT_RELATED_TOOLS[toolId] ?? [];
  const scored: Array<RelatedTool & { score: number }> = base.map((t) => ({ ...t, score: 0 }));

  function boost(href: string, points: number, overrideLabel?: Record<string, string>) {
    const t = scored.find((t) => t.href === href);
    if (t) { t.score += points; if (overrideLabel) t.label = overrideLabel; }
    else scored.push({ href, label: overrideLabel ?? { en: href }, score: points });
  }

  if (toolId === 'lead-flow') {
    if (answers.contact === 'whatsapp') boost('automation-finder', 2, { he: 'אוטומט את תגובות ה-WhatsApp שלך', en: 'Automate your WhatsApp follow-ups', es: 'Automatiza tus seguimientos de WhatsApp', ru: 'Автоматизируйте ответы в WhatsApp' });
    if (answers.followup === 'nothing' || answers.followup === 'manual') boost('automation-finder', 3, { he: 'תקן את אובדן הלידים שלך', en: 'Fix your lead leakage', es: 'Corrige tu fuga de leads', ru: 'Исправьте утечку лидов' });
    if (answers.followup !== 'crm') boost('tool-stack', 1);
  }

  if (toolId === 'business-audit') {
    const hours = Number(answers.hours ?? 0);
    if (hours > 10) boost('automation-finder', 3, { he: 'גלה מה ניתן לאוטומציה עכשיו', en: 'Find what you can automate now', es: 'Encuentra qué puedes automatizar ahora', ru: 'Найдите что можно автоматизировать сейчас' });
    if (answers.crm === 'none' || answers.crm === 'spreadsheet') boost('tool-stack', 2, { he: 'בחר את ה-CRM הנכון לגודלך', en: 'Choose the right CRM for your size', es: 'Elige el CRM adecuado para tu tamaño', ru: 'Выберите подходящий CRM' });
  }

  if (toolId === 'website-audit') {
    if (answers.cta === 'none' || answers.cta === 'weak') boost('lead-flow', 2, { he: 'מפה איך לידים זורמים לאתר שלך', en: 'Map how leads flow through your site', es: 'Mapea cómo fluyen los leads por tu sitio', ru: 'Создайте карту потока лидов на сайте' });
    if (answers.analytics === 'none') boost('business-audit', 1);
  }

  if (toolId === 'automation-finder') {
    const hrs = Number(answers.hours ?? 0);
    if (hrs > 8) boost('business-audit', 2, { he: 'ראה את התמונה המלאה של הזמן שלך', en: 'See the full picture of your time', es: 'Ve el panorama completo de tu tiempo', ru: 'Увидьте полную картину вашего времени' });
    if (answers.process === 'manual') boost('lead-flow', 1);
  }

  if (toolId === 'ai-readiness') {
    if (answers.support === 'many') boost('automation-finder', 3, { he: 'אוטמט תמיכה לפני ש-AI', en: 'Automate support before adding AI', es: 'Automatiza soporte antes de añadir IA', ru: 'Автоматизируйте поддержку перед ИИ' });
    if (answers.data === 'none') boost('business-audit', 2);
  }

  if (toolId === 'tool-stack') {
    if (Array.isArray(answers.pains) && (answers.pains as string[]).includes('disconnected')) boost('automation-finder', 3, { he: 'חבר את הכלים שלך ב-30 דקות', en: 'Connect your tools in 30 minutes', es: 'Conecta tus herramientas en 30 minutos', ru: 'Подключите инструменты за 30 минут' });
    if (Array.isArray(answers.pains) && (answers.pains as string[]).includes('unused')) boost('business-audit', 1);
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 3).map(({ href, label }) => ({ href, label }));
}

interface ToolResultProps {
  lang: Lang;
  toolId: string;
  t: {
    yourScore: string;
    topFindings: string;
    quickWins: string;
    nextActions: string;
    relatedTools: string;
    startOver: string;
    newsletterTitle: string;
    newsletterPlaceholder: string;
    newsletterCta: string;
    newsletterDisclaimer: string;
  };
  scoreBlock?: React.ReactNode;
  findings?: string[];
  quickWins?: string[];
  nextActions?: string[];
  answers?: Record<string, unknown>;
  relatedTools?: RelatedTool[];
  relatedArticles?: RelatedArticle[];
  onReset: () => void;
  children?: React.ReactNode;
}

const DEFAULT_RELATED_TOOLS: Record<string, RelatedTool[]> = {
  'business-audit': [
    { href: 'automation-finder', label: { he: 'מאתר הזדמנויות אוטומציה', en: 'Automation Opportunity Finder', es: 'Buscador de Automatización', ru: 'Поиск возможностей автоматизации' } },
    { href: 'website-audit', label: { he: 'ביקורת מינוף אתרים', en: 'Website Leverage Audit', es: 'Auditoría de Sitio Web', ru: 'Аудит сайта' } },
    { href: 'lead-flow', label: { he: 'ממפה זרימת לידים', en: 'Lead Flow Mapper', es: 'Mapeador de Leads', ru: 'Карта потока лидов' } },
  ],
  'website-audit': [
    { href: 'business-audit', label: { he: 'ביקורת טכנולוגיה עסקית', en: 'Business Technology Audit', es: 'Auditoría Tecnológica', ru: 'Бизнес-аудит' } },
    { href: 'lead-flow', label: { he: 'ממפה זרימת לידים', en: 'Lead Flow Mapper', es: 'Mapeador de Leads', ru: 'Карта потока лидов' } },
    { href: 'automation-finder', label: { he: 'מאתר אוטומציה', en: 'Automation Finder', es: 'Buscador de Automatización', ru: 'Поиск автоматизации' } },
  ],
  'automation-finder': [
    { href: 'lead-flow', label: { he: 'ממפה זרימת לידים', en: 'Lead Flow Mapper', es: 'Mapeador de Leads', ru: 'Карта потока лидов' } },
    { href: 'tool-stack', label: { he: 'מפשט מחסנית כלים', en: 'Tool Stack Simplifier', es: 'Simplificador de Herramientas', ru: 'Упрощение стека инструментов' } },
    { href: 'business-audit', label: { he: 'ביקורת עסקית', en: 'Business Audit', es: 'Auditoría Empresarial', ru: 'Бизнес-аудит' } },
  ],
  'ai-readiness': [
    { href: 'automation-finder', label: { he: 'מאתר הזדמנויות אוטומציה', en: 'Automation Opportunity Finder', es: 'Buscador de Automatización', ru: 'Поиск автоматизации' } },
    { href: 'business-audit', label: { he: 'ביקורת עסקית', en: 'Business Audit', es: 'Auditoría Empresarial', ru: 'Бизнес-аудит' } },
  ],
  'tool-stack': [
    { href: 'automation-finder', label: { he: 'מאתר הזדמנויות אוטומציה', en: 'Automation Finder', es: 'Buscador de Automatización', ru: 'Поиск автоматизации' } },
    { href: 'business-audit', label: { he: 'ביקורת עסקית', en: 'Business Audit', es: 'Auditoría Empresarial', ru: 'Бизнес-аудит' } },
  ],
  'lead-flow': [
    { href: 'automation-finder', label: { he: 'מאתר הזדמנויות אוטומציה', en: 'Automation Finder', es: 'Buscador de Automatización', ru: 'Поиск автоматизации' } },
    { href: 'website-audit', label: { he: 'ביקורת אתר', en: 'Website Audit', es: 'Auditoría de Sitio', ru: 'Аудит сайта' } },
    { href: 'tool-stack', label: { he: 'מפשט מחסנית כלים', en: 'Tool Stack Simplifier', es: 'Simplificador de Herramientas', ru: 'Упрощение стека' } },
  ],
};

const DEFAULT_ARTICLES: Record<string, RelatedArticle[]> = {
  'business-audit': [
    { href: '/thinking/automatable-work', label: { he: 'למה עסקים קטנים מפסידים 15+ שעות', en: 'Why Small Businesses Lose 15+ Hours/Week', es: 'Por qué pequeñas empresas pierden 15+ horas', ru: 'Почему малый бизнес теряет 15+ часов' }, category: { he: 'אוטומציה', en: 'Automation', es: 'Automatización', ru: 'Автоматизация' } },
    { href: '/thinking/right-sized-crm', label: { he: 'אתה לא צריך Salesforce', en: 'You Don\'t Need Salesforce', es: 'No necesitas Salesforce', ru: 'Вам не нужен Salesforce' }, category: { he: 'CRM', en: 'CRM', es: 'CRM', ru: 'CRM' } },
  ],
  'website-audit': [
    { href: '/thinking/website-system', label: { he: 'האתר שלך הוא פרוספקטוס', en: 'Your Website Is a Brochure', es: 'Tu sitio web es un folleto', ru: 'Ваш сайт — это брошюра' }, category: { he: 'אתרים', en: 'Websites', es: 'Sitios web', ru: 'Сайты' } },
  ],
  'automation-finder': [
    { href: '/thinking/automatable-work', label: { he: 'עבודה שניתנת לאוטומציה', en: 'Automatable Work', es: 'Trabajo automatizable', ru: 'Автоматизируемая работа' }, category: { he: 'אוטומציה', en: 'Automation', es: 'Automatización', ru: 'Автоматизация' } },
  ],
  'ai-readiness': [
    { href: '/thinking/ai-reality-check', label: { he: 'מה AI יכול לעשות לעסק שלך', en: 'What AI Can Do for Your Business', es: 'Qué puede hacer la IA', ru: 'Что ИИ может для вашего бизнеса' }, category: { he: 'AI', en: 'AI', es: 'IA', ru: 'ИИ' } },
  ],
  'tool-stack': [
    { href: '/thinking/right-sized-crm', label: { he: 'CRM שמתאים לגודל שלך', en: 'CRM That Fits Your Size', es: 'CRM que se adapta a tu tamaño', ru: 'CRM по вашему размеру' }, category: { he: 'CRM', en: 'CRM', es: 'CRM', ru: 'CRM' } },
  ],
  'lead-flow': [
    { href: '/thinking/automatable-work', label: { he: 'עבודה שניתנת לאוטומציה', en: 'Automatable Work', es: 'Trabajo automatizable', ru: 'Автоматизируемая работа' }, category: { he: 'אוטומציה', en: 'Automation', es: 'Automatización', ru: 'Автоматизация' } },
    { href: '/thinking/website-system', label: { he: 'הפוך את האתר למערכת', en: 'Make Your Site a System', es: 'Convierte tu sitio en sistema', ru: 'Превратите сайт в систему' }, category: { he: 'אתרים', en: 'Websites', es: 'Sitios web', ru: 'Сайты' } },
  ],
};

function downloadSummary(toolId: string, lang: Lang, findings: string[], quickWins: string[], nextActions: string[]) {
  const labels: Record<string, Record<Lang, string>> = {
    title: { he: 'סיכום כלי', en: 'Tool Summary', es: 'Resumen del diagnóstico', ru: 'Сводка инструмента' },
    findings: { he: 'ממצאים', en: 'Findings', es: 'Hallazgos', ru: 'Выводы' },
    wins: { he: 'ניצחונות מהירים', en: 'Quick Wins', es: 'Victorias rápidas', ru: 'Быстрые победы' },
    next: { he: 'הצעדים הבאים', en: 'Next Actions', es: 'Próximas acciones', ru: 'Следующие шаги' },
    footer: { he: 'shiiift.com — טכנולוגיה שמפחיתה חיכוך', en: 'shiiift.com — Technology that reduces friction', es: 'shiiift.com — Tecnología que reduce la fricción', ru: 'shiiift.com — Технологии, снижающие трение' },
  };
  const lines: string[] = [
    `${labels.title[lang]} — ${toolId}`,
    `shiiift.com | ${new Date().toLocaleDateString()}`,
    '',
  ];
  if (findings.length) {
    lines.push(`--- ${labels.findings[lang]} ---`);
    findings.forEach((f, i) => lines.push(`${i + 1}. ${f}`));
    lines.push('');
  }
  if (quickWins.length) {
    lines.push(`--- ${labels.wins[lang]} ---`);
    quickWins.forEach((w, i) => lines.push(`${i + 1}. ${w}`));
    lines.push('');
  }
  if (nextActions.length) {
    lines.push(`--- ${labels.next[lang]} ---`);
    nextActions.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
    lines.push('');
  }
  lines.push(labels.footer[lang]);
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shiiift-${toolId}-summary.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ToolResult({
  lang,
  toolId,
  t,
  scoreBlock,
  findings = [],
  quickWins = [],
  nextActions = [],
  answers = {},
  relatedTools,
  relatedArticles,
  onReset,
  children,
}: ToolResultProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [roadmapSent, setRoadmapSent] = useState(false);

  useEffect(() => {
    saveToolResult({ tool_id: toolId, lang, answers: {}, score: undefined });
  }, []);

  const tools = relatedTools ?? computeSmartTools(toolId, answers, lang);
  const articles = relatedArticles ?? DEFAULT_ARTICLES[toolId] ?? [];

  const dlLabel: Record<Lang, string> = {
    he: 'הורד סיכום (.txt)',
    en: 'Download summary (.txt)',
    es: 'Descargar resumen (.txt)',
    ru: 'Скачать сводку (.txt)',
  };
  const roadmapLabel: Record<Lang, string> = {
    he: 'בקש מפת דרכים מותאמת',
    en: 'Request a personalised roadmap',
    es: 'Solicitar un roadmap personalizado',
    ru: 'Запросить персонализированный план',
  };
  const roadmapSentLabel: Record<Lang, string> = {
    he: '✓ נשלח — נחזור אליך',
    en: '✓ Sent — we\'ll be in touch',
    es: '✓ Enviado — te contactaremos',
    ru: '✓ Отправлено — мы свяжемся',
  };
  const articlesLabel: Record<Lang, string> = {
    he: 'קריאה קשורה',
    en: 'Related Reading',
    es: 'Lectura relacionada',
    ru: 'Связанные материалы',
  };

  function handleNewsletter() {
    if (!email) return;
    setSubscribed(true);
    trackEvent('newsletter_submitted', { tool: toolId, lang });
    saveNewsletterSignup({ email, tool_id: toolId, lang });
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'form-name': 'tool-newsletter', email, tool: toolId, lang }).toString(),
    }).catch(() => {});
  }

  return (
    <div className="space-y-5">
      {/* Score / custom header block */}
      {scoreBlock && (
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.055) 0%, #151A23 30%, #111620 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottomColor: 'rgba(0,0,0,0.4)',
          boxShadow: 'var(--v-shadow-md)',
          borderRadius: '1rem',
          padding: '1.5rem 2rem',
        }}>
          {scoreBlock}
        </div>
      )}

      {/* Additional children (custom blocks) */}
      {children}

      {/* Findings */}
      {findings.length > 0 && (
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, #151A23 30%, #111620 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderBottomColor: 'rgba(0,0,0,0.4)',
          boxShadow: 'var(--v-shadow-md)',
          borderRadius: '1rem',
          padding: '1.5rem',
        }}>
          <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-4">{t.topFindings}</p>
          <ul className="space-y-3">
            {findings.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#A7AFBA] leading-snug">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A59] flex-shrink-0 mt-2"></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Wins */}
      {quickWins.length > 0 && (
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, #151A23 30%, #111620 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderBottomColor: 'rgba(0,0,0,0.4)',
          boxShadow: 'var(--v-shadow-md)',
          borderRadius: '1rem',
          padding: '1.5rem',
        }}>
          <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-4">{t.quickWins}</p>
          <ul className="space-y-3">
            {quickWins.map((w, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#F4F1EA] leading-snug">
                <span className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center font-mono text-[10px] text-[#C7FF4A]"
                  style={{ background: 'rgba(199,255,74,0.08)', border: '1px solid rgba(199,255,74,0.25)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                  {i + 1}
                </span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Actions */}
      {nextActions.length > 0 && (
        <div style={{
          background: 'linear-gradient(160deg, rgba(199,255,74,0.04) 0%, #151A23 60%, #111620 100%)',
          border: '1px solid rgba(199,255,74,0.12)',
          borderBottomColor: 'rgba(0,0,0,0.4)',
          boxShadow: 'var(--v-shadow-md)',
          borderRadius: '1rem',
          padding: '1.5rem',
        }}>
          <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-4">{t.nextActions}</p>
          <ol className="space-y-3">
            {nextActions.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#F4F1EA] leading-snug">
                <span className="font-mono text-[#C7FF4A]/60 text-xs mt-0.5 flex-shrink-0 w-4">{i + 1}.</span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Related Articles */}
      {articles.length > 0 && (
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, #151A23 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottomColor: 'rgba(0,0,0,0.35)',
          boxShadow: 'var(--v-shadow-sm)',
          borderRadius: '1rem',
          padding: '1.5rem',
        }}>
          <p className="font-mono text-xs tracking-widest uppercase text-[#A7AFBA] mb-4">{articlesLabel[lang]}</p>
          <div className="space-y-2">
            {articles.map((a) => (
              <a
                key={a.href}
                href={`/${lang}${a.href}`}
                onClick={() => trackEvent('related_article_clicked', { tool: toolId, article: a.href, lang })}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-[#A7AFBA] hover:text-[#F4F1EA] no-underline transition-all group"
                style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(14,17,23,0.5) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderBottomColor: 'rgba(0,0,0,0.3)', boxShadow: 'var(--v-shadow-sm)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-[#A7AFBA]/50 border border-[rgba(255,255,255,0.08)] px-1.5 py-0.5 rounded">{gl(a.category, lang)}</span>
                  <span className="group-hover:text-[#F4F1EA] transition-colors">{gl(a.label, lang)}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 rtl:rotate-180 opacity-40 group-hover:opacity-80">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Related Tools */}
      {tools.length > 0 && (
        <div style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, #151A23 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderBottomColor: 'rgba(0,0,0,0.4)',
          boxShadow: 'var(--v-shadow-md)',
          borderRadius: '1rem',
          padding: '1.5rem',
        }}>
          <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-4">{t.relatedTools}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tools.map((tool) => (
              <a
                key={tool.href}
                href={`/${lang}/tools/${tool.href}`}
                onClick={() => trackEvent('related_tool_clicked', { tool: toolId, target: tool.href, lang })}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm text-[#A7AFBA] hover:text-[#F4F1EA] no-underline transition-all group"
                style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, #1a202c 100%)', border: '1px solid rgba(255,255,255,0.08)', borderBottomColor: 'rgba(0,0,0,0.35)', boxShadow: 'var(--v-shadow-sm)' }}
              >
                <span className="group-hover:text-[#F4F1EA] transition-colors">{gl(tool.label, lang)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 rtl:rotate-180 opacity-40 group-hover:opacity-80">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div style={{
        background: 'linear-gradient(160deg, rgba(255,255,255,0.05) 0%, #151A23 40%, #111620 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderBottomColor: 'rgba(0,0,0,0.4)',
        boxShadow: 'var(--v-shadow-md)',
        borderRadius: '1rem',
        padding: '1.5rem',
      }}>
        <p className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-[#F4F1EA] mb-1">{t.newsletterTitle}</p>
        {subscribed ? (
          <p className="text-sm text-[#C7FF4A] mt-2">✓</p>
        ) : (
          <form
            name="tool-newsletter"
            data-netlify="true"
            onSubmit={(e) => { e.preventDefault(); handleNewsletter(); }}
            className="flex gap-2 mt-3"
          >
            <input type="hidden" name="form-name" value="tool-newsletter" />
            <input type="hidden" name="tool" value={toolId} />
            <input type="hidden" name="lang" value={lang} />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.newsletterPlaceholder}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] placeholder-[#A7AFBA]/50 outline-none"
              style={{ background: 'linear-gradient(180deg, #0f131b 0%, #141921 100%)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 1px 0 0 rgba(0,0,0,0.5) inset, 0 2px 6px rgba(0,0,0,0.35) inset' }}
            />
            <button
              type="submit"
              className="flex-shrink-0 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
              style={{ background: 'linear-gradient(180deg, #d6ff5e 0%, #c7ff4a 45%, #aee038 100%)', color: '#0E1117', boxShadow: 'var(--v-shadow-accent)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {t.newsletterCta}
            </button>
          </form>
        )}
        <p className="mt-2 text-xs text-[#A7AFBA]/60">{t.newsletterDisclaimer}</p>
      </div>

      {/* Roadmap request */}
      {!roadmapSent ? (
        <div className="text-center">
          <button
            onClick={() => {
              setRoadmapSent(true);
              trackEvent('roadmap_requested', { tool: toolId, lang });
              window.location.href = `/${lang}/start`;
            }}
            className="text-sm text-[#A7AFBA] hover:text-[#C7FF4A] font-mono transition-colors underline underline-offset-4"
          >
            {roadmapLabel[lang]}
          </button>
        </div>
      ) : (
        <p className="text-center text-sm text-[#C7FF4A] font-mono">{roadmapSentLabel[lang]}</p>
      )}

      {/* Download + Reset row */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onReset}
          className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] transition-colors font-mono"
        >
          ↺ {t.startOver}
        </button>
        <button
          onClick={() => {
            downloadSummary(toolId, lang, findings, quickWins, nextActions);
            trackEvent('summary_downloaded', { tool: toolId, lang });
          }}
          className="text-sm text-[#A7AFBA] hover:text-[#C7FF4A] transition-colors font-mono"
        >
          ↓ {dlLabel[lang]}
        </button>
      </div>
    </div>
  );
}
