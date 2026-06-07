import { useState, useEffect } from 'react';
import ToolResult, { useToolSession, trackEvent } from './ToolResult';

interface N8nTemplate {
  id: number;
  name: string;
  description?: string;
  url?: string;
}

const TASK_TO_QUERY: Record<string, string> = {
  followup: 'crm follow-up email',
  invoicing: 'invoice payment',
  scheduling: 'calendar scheduling',
  reporting: 'automated report',
  dataentry: 'data sync spreadsheet',
  onboarding: 'client onboarding',
};

async function fetchN8nTemplates(tasks: string[]): Promise<N8nTemplate[]> {
  const query = tasks.map((t) => TASK_TO_QUERY[t] ?? t).join(' ');
  try {
    const res = await fetch(`https://api.n8n.io/api/templates/search?text=${encodeURIComponent(query)}&limit=3`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.workflows ?? []).slice(0, 3).map((w: any) => ({
      id: w.id,
      name: w.name,
      description: w.description?.replace(/<[^>]*>/g, '').slice(0, 120) ?? '',
      url: `https://n8n.io/workflows/${w.id}`,
    }));
  } catch {
    return [];
  }
}

type Lang = 'he' | 'en' | 'es' | 'ru';
type T = { back: string; next: string; seeResults: string; startOver: string; yourScore: string; topFindings: string; quickWins: string; nextActions: string; relatedTools: string; newsletterTitle: string; newsletterPlaceholder: string; newsletterCta: string; newsletterDisclaimer: string; lang: string };

function gl(o: Record<string, string>, l: string) { return o[l] ?? o['en'] ?? ''; }

const QS = [
  {
    id: 'tasks',
    q: { he: 'אילו משימות הכי חוזרות בעסק שלך?', en: 'What are your most repetitive tasks?', es: '¿Cuáles son tus tareas más repetitivas?', ru: 'Какие у вас самые повторяющиеся задачи?' },
    multi: true,
    opts: [
      { v: 'followup', l: { he: 'מעקב אחר לקוחות', en: 'Customer follow-up', es: 'Seguimiento de clientes', ru: 'Follow-up клиентов' } },
      { v: 'invoicing', l: { he: 'חשבוניות / תשלומים', en: 'Invoicing / payments', es: 'Facturación / pagos', ru: 'Выставление счетов' } },
      { v: 'scheduling', l: { he: 'תיאום פגישות / לוחות זמנים', en: 'Scheduling / calendars', es: 'Programación / calendarios', ru: 'Планирование встреч' } },
      { v: 'reporting', l: { he: 'הכנת דוחות', en: 'Preparing reports', es: 'Preparación de informes', ru: 'Подготовка отчётов' } },
      { v: 'dataentry', l: { he: 'הזנת נתונים', en: 'Data entry', es: 'Entrada de datos', ru: 'Ввод данных' } },
      { v: 'onboarding', l: { he: 'קליטת לקוחות חדשים', en: 'Client onboarding', es: 'Incorporación de clientes', ru: 'Онбординг клиентов' } },
    ],
  },
  {
    id: 'channels',
    q: { he: 'אילו ערוצי תקשורת אתה משתמש בהם?', en: 'Which communication channels do you use?', es: '¿Qué canales de comunicación usas?', ru: 'Какие каналы связи вы используете?' },
    multi: true,
    opts: [
      { v: 'whatsapp', l: { he: 'WhatsApp', en: 'WhatsApp', es: 'WhatsApp', ru: 'WhatsApp' } },
      { v: 'email', l: { he: 'אימייל', en: 'Email', es: 'Email', ru: 'Email' } },
      { v: 'phone', l: { he: 'טלפון', en: 'Phone', es: 'Teléfono', ru: 'Телефон' } },
      { v: 'crm', l: { he: 'CRM', en: 'CRM', es: 'CRM', ru: 'CRM' } },
      { v: 'slack', l: { he: 'Slack / Teams', en: 'Slack / Teams', es: 'Slack / Teams', ru: 'Slack / Teams' } },
    ],
  },
  {
    id: 'hours',
    q: { he: 'כמה שעות בשבוע הולכות לעבודה ידנית?', en: 'How many hours/week go to manual work?', es: '¿Cuántas horas/semana van a trabajo manual?', ru: 'Сколько часов в неделю уходит на ручную работу?' },
    multi: false,
    opts: [
      { v: '1-5', l: { he: '1–5 שעות', en: '1–5 hours', es: '1–5 horas', ru: '1–5 часов' } },
      { v: '5-10', l: { he: '5–10 שעות', en: '5–10 hours', es: '5–10 horas', ru: '5–10 часов' } },
      { v: '10-20', l: { he: '10–20 שעות', en: '10–20 hours', es: '10–20 horas', ru: '10–20 часов' } },
      { v: '20+', l: { he: 'יותר מ-20 שעות', en: 'More than 20 hours', es: 'Más de 20 horas', ru: 'Более 20 часов' } },
    ],
  },
];

const HOURS_MAP: Record<string, number> = { '1-5': 3, '5-10': 7, '10-20': 15, '20+': 22 };

const CANDIDATES: Record<string, Record<string, string>> = {
  followup: { he: 'אוטומציית מעקב — CRM + Email/WhatsApp', en: 'Follow-up automation — CRM + Email/WhatsApp', es: 'Automatización de seguimiento — CRM + Email/WhatsApp', ru: 'Автоматизация follow-up — CRM + Email/WhatsApp' },
  invoicing: { he: 'אוטומציית חשבוניות — Stripe / QuickBooks + Zapier', en: 'Invoice automation — Stripe / QuickBooks + Zapier', es: 'Automatización de facturas — Stripe / QuickBooks + Zapier', ru: 'Автоматизация счетов — Stripe / QuickBooks + Zapier' },
  scheduling: { he: 'ניהול לוח זמנים — Calendly / Cal.com', en: 'Scheduling automation — Calendly / Cal.com', es: 'Automatización de agenda — Calendly / Cal.com', ru: 'Автоматизация расписания — Calendly / Cal.com' },
  reporting: { he: 'לוח מחוונים אוטומטי — Google Looker Studio / Databox', en: 'Automated dashboard — Google Looker Studio / Databox', es: 'Dashboard automatizado — Google Looker Studio / Databox', ru: 'Автоматический дашборд — Google Looker Studio / Databox' },
  dataentry: { he: 'אוטומציית הזנת נתונים — Zapier / Make.com', en: 'Data entry automation — Zapier / Make.com', es: 'Automatización de entrada de datos — Zapier / Make.com', ru: 'Автоматизация ввода данных — Zapier / Make.com' },
  onboarding: { he: 'זרימת קליטה — טופס + אימייל + CRM', en: 'Onboarding flow — form + email + CRM', es: 'Flujo de incorporación — formulario + email + CRM', ru: 'Поток онбординга — форма + email + CRM' },
};

export default function AutomationFinder({ t }: { t: T }) {
  const lang = (t.lang || 'en') as Lang;
  const [session, setSession, clearSession] = useToolSession('automation-finder', {
    step: 0,
    answers: {} as Record<string, string[]>,
    selected: [] as string[],
  });
  const { step, answers, selected } = session;

  const [n8nTemplates, setN8nTemplates] = useState<N8nTemplate[]>([]);
  const [n8nLoading, setN8nLoading] = useState(false);

  const isResult = step >= QS.length;
  const cq = QS[step];
  const tasks = answers.tasks || [];
  const hours = HOURS_MAP[answers.hours?.[0]] || 0;
  const candidates = tasks.map((t) => CANDIDATES[t]).filter(Boolean);

  const multiLabel = { he: 'בחר כמה שרלוונטי', en: 'Select all that apply', es: 'Selecciona todo lo que aplique', ru: 'Выберите все подходящие' };
  const hoursLabel = { he: 'שעות/שבוע ניתנות לשחזור', en: 'hours/week recoverable', es: 'horas/semana recuperables', ru: 'часов/неделю восстановимо' };

  const nextActions = [
    tasks.includes('followup') && { he: 'הגדר זרימת מעקב אוטומטית ב-CRM — תסיר את הצורך לזכור', en: 'Build a CRM auto-follow-up flow — removes the need to remember', es: 'Construye un flujo de seguimiento automático en CRM', ru: 'Настройте авто-follow-up в CRM — устраните зависимость от памяти' },
    tasks.includes('scheduling') && { he: 'הטמע Calendly/Cal.com עם אינטגרציה ל-CRM', en: 'Embed Calendly/Cal.com with CRM integration', es: 'Incorpora Calendly/Cal.com con integración al CRM', ru: 'Внедрите Calendly/Cal.com с интеграцией в CRM' },
    hours >= 10 && { he: 'עבוד עם shiiift למיפוי ואוטומציה של 3 תהליכים עדיפים', en: 'Work with shiiift to map and automate your top 3 processes', es: 'Trabaja con shiiift para mapear y automatizar tus 3 procesos principales', ru: 'Работайте с shiiift для маппинга и автоматизации 3 ключевых процессов' },
  ].filter(Boolean).map((a: any) => gl(a, lang));

  useEffect(() => {
    if (step === 0 && Object.keys(answers).length === 0) trackEvent('tool_started', { tool: 'automation-finder', lang });
  }, []);
  useEffect(() => {
    if (!isResult) return;
    trackEvent('tool_completed', { tool: 'automation-finder', lang, hours: String(hours) });
    if (tasks.length > 0) {
      setN8nLoading(true);
      fetchN8nTemplates(tasks).then((tpls) => { setN8nTemplates(tpls); setN8nLoading(false); });
    }
  }, [isResult]);

  function toggle(v: string) {
    if (cq?.multi) {
      setSession((s) => ({ ...s, selected: s.selected.includes(v) ? s.selected.filter((x) => x !== v) : [...s.selected, v] }));
    } else {
      setSession((s) => ({ ...s, selected: [v] }));
    }
  }

  const n8nLabel = { he: 'תבניות אוטומציה מ-n8n — מוכנות לשימוש', en: 'Ready-to-use automation templates from n8n', es: 'Plantillas de automatización de n8n — listas para usar', ru: 'Готовые шаблоны автоматизации из n8n' };
  const n8nCta = { he: 'פתח תבנית ↗', en: 'Open template ↗', es: 'Abrir plantilla ↗', ru: 'Открыть шаблон ↗' };

  const templatesBlock = (n8nLoading || n8nTemplates.length > 0) ? (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-shift-warm/5 to-shift-surface border border-shift-warm/15 shadow-md">
      <p className="font-mono text-xs tracking-widest uppercase text-shift-warm mb-4">{gl(n8nLabel, lang)}</p>
      {n8nLoading ? (
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-shift-warm border-t-transparent animate-spin flex-shrink-0" />
          <span className="text-sm text-shift-muted font-mono">{lang === 'he' ? 'מחפש תבניות...' : lang === 'ru' ? 'Ищем шаблоны...' : lang === 'es' ? 'Buscando plantillas...' : 'Finding templates...'}</span>
        </div>
      ) : (
        <div className="space-y-2">
          {n8nTemplates.map((tpl) => (
            <a key={tpl.id} href={tpl.url} target="_blank" rel="noopener noreferrer"
              className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl no-underline group transition-all bg-white/[0.03] border border-white/[0.07] hover:border-shift-warm/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shift-warm"
            >
              <div className="min-w-0">
                <p className="text-sm text-shift-text font-medium group-hover:text-shift-warm transition-colors truncate">{tpl.name}</p>
                {tpl.description && <p className="text-xs text-shift-muted mt-0.5 leading-snug line-clamp-2">{tpl.description}</p>}
              </div>
              <span className="font-mono text-xs text-shift-warm flex-shrink-0 mt-0.5">{gl(n8nCta, lang)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  ) : null;

  if (isResult) {
    return (
      <ToolResult
        lang={lang}
        toolId="automation-finder"
        t={t}
        answers={answers}
        quickWins={candidates.map((c) => gl(c, lang))}
        nextActions={nextActions}
        onReset={clearSession}
        scoreBlock={
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-shift-warm mb-3">{t.yourScore}</p>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-bold text-5xl text-shift-text font-heading">{hours}</span>
              <span className="text-shift-muted text-sm">{gl(hoursLabel, lang)}</span>
            </div>
          </div>
        }
      >
        {templatesBlock}
      </ToolResult>
    );
  }

  const progress = Math.round((step / QS.length) * 100);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-shift-muted"><span>{step + 1} / {QS.length}</span><span>{progress}%</span></div>
        <div className="shift-progress-track">
          <div className="h-full rounded-full transition-transform duration-300" style={{ width: '100%', transform: `scaleX(${progress / 100})`, transformOrigin: lang === 'he' ? 'right' : 'left', background: 'linear-gradient(90deg,var(--shift-warm),#e05535)', boxShadow: '0 0 6px rgba(255,122,89,0.35)' }} />
        </div>
      </div>
      <div className="shift-card">
        <h2 className="font-heading font-semibold text-xl text-shift-text mb-2">{gl(cq.q, lang)}</h2>
        {cq.multi && <p className="text-xs text-shift-muted/80 font-mono mb-5">{gl(multiLabel, lang)}</p>}
        <div className="space-y-2">
          {cq.opts.map((o) => {
            const isSelected = selected.includes(o.v);
            return (
              <button key={o.v} onClick={() => toggle(o.v)}
                className={`w-full text-start px-4 py-3.5 rounded-xl text-sm transition-all flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shift-warm focus-visible:ring-offset-2 focus-visible:ring-offset-shift-bg ${
                  isSelected
                    ? 'bg-gradient-to-br from-shift-warm/10 to-shift-warm/5 border border-shift-warm/45 text-shift-text shadow-sm'
                    : 'bg-gradient-to-br from-white/[0.04] to-shift-surface border border-white/[0.08] border-b-black/35 text-shift-muted shadow-sm hover:border-shift-warm/25'
                }`}
              >
                <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                  isSelected ? 'bg-shift-warm border-shift-warm' : 'border-shift-text/25'
                }`}>
                  {isSelected && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0E1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
                {gl(o.l, lang)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (step === 0) return; const pq = QS[step-1]; setSession((s) => ({...s, step:s.step-1, selected: s.answers[pq.id]||[]})); }}
          disabled={step === 0} className="text-sm text-shift-muted hover:text-shift-text disabled:opacity-30 disabled:cursor-not-allowed font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shift-warm focus-visible:ring-offset-2 focus-visible:ring-offset-shift-bg rounded px-1">{lang === 'he' ? '→' : '←'} {t.back}
        </button>
        <button
          onClick={() => { if (!selected.length) return; setSession((s) => ({...s, answers:{...s.answers,[cq.id]:selected}, selected:[], step:s.step+1})); }}
          disabled={!selected.length}
          className="inline-flex items-center gap-2 font-heading font-semibold text-sm px-6 py-2.5 rounded-xl transition-all duration-150 no-underline bg-gradient-to-b from-[#ff9070] via-shift-warm to-[#e05535] text-white shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_-1px_0_0_rgba(0,0,0,0.2)_inset,0_4px_12px_rgba(255,122,89,0.25)] border border-white/15 disabled:opacity-40 disabled:cursor-not-allowed hover:from-[#ff9c7f] hover:to-[#eb5e3b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shift-warm focus-visible:ring-offset-2 focus-visible:ring-offset-shift-bg"
        >
          {step === QS.length - 1 ? t.seeResults : t.next} {lang === 'he' ? '←' : '→'}
        </button>
      </div>
    </div>
  );
}
