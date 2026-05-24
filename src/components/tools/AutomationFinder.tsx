import { useState, useEffect } from 'react';
import ToolResult from './ToolResult';
import { useToolSession, trackEvent } from './useToolSession';

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
    if (isResult) trackEvent('tool_completed', { tool: 'automation-finder', lang, hours: String(hours) });
  }, [isResult]);

  function toggle(v: string) {
    if (cq?.multi) {
      setSession((s) => ({ ...s, selected: s.selected.includes(v) ? s.selected.filter((x) => x !== v) : [...s.selected, v] }));
    } else {
      setSession((s) => ({ ...s, selected: [v] }));
    }
  }

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
            <p className="font-mono text-xs tracking-widest uppercase text-[#FF7A59] mb-3">{t.yourScore}</p>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-['Inter_Tight',system-ui,sans-serif] font-bold text-5xl text-[#F4F1EA]">{hours}</span>
              <span className="text-[#A7AFBA] text-sm">{gl(hoursLabel, lang)}</span>
            </div>
          </div>
        }
      />
    );
  }

  const progress = Math.round((step / QS.length) * 100);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-[#A7AFBA]"><span>{step + 1} / {QS.length}</span><span>{progress}%</span></div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg,#0c1018,#141a24)', boxShadow: '0 1px 3px rgba(0,0,0,0.5) inset' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#e05535,#ff7a59)', boxShadow: '0 0 6px rgba(255,122,89,0.35)' }} />
        </div>
      </div>
      <div style={{ background: 'linear-gradient(160deg,rgba(255,255,255,0.055) 0%,#151A23 30%,#111620 100%)', border: '1px solid rgba(255,255,255,0.1)', borderBottomColor: 'rgba(0,0,0,0.4)', boxShadow: 'var(--v-shadow-md)', borderRadius: '1rem', padding: '1.5rem 2rem' }}>
        <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-2">{gl(cq.q, lang)}</h2>
        {cq.multi && <p className="text-xs text-[#A7AFBA]/60 font-mono mb-5">{gl(multiLabel, lang)}</p>}
        <div className="space-y-2">
          {cq.opts.map((o) => (
            <button key={o.v} onClick={() => toggle(o.v)}
              className="w-full text-start px-4 py-3.5 rounded-xl text-sm transition-all flex items-center gap-3"
              style={selected.includes(o.v)
                ? { background: 'linear-gradient(160deg,rgba(255,122,89,0.1) 0%,rgba(255,122,89,0.04) 100%)', border: '1px solid rgba(255,122,89,0.45)', color: '#F4F1EA', boxShadow: 'var(--v-shadow-sm)' }
                : { background: 'linear-gradient(160deg,rgba(255,255,255,0.04) 0%,#151a23 100%)', border: '1px solid rgba(255,255,255,0.08)', borderBottomColor: 'rgba(0,0,0,0.35)', color: '#A7AFBA', boxShadow: 'var(--v-shadow-sm)' }
              }
            >
              <span className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all"
                style={selected.includes(o.v) ? { background: '#FF7A59', border: '1px solid #FF7A59' } : { border: '1px solid rgba(244,241,234,0.25)' }}>
                {selected.includes(o.v) && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0E1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
              {gl(o.l, lang)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (step === 0) return; const pq = QS[step-1]; setSession((s) => ({...s, step:s.step-1, selected: s.answers[pq.id]||[]})); }}
          disabled={step === 0} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] disabled:opacity-30 font-mono transition-colors">{lang === 'he' ? '→' : '←'} {t.back}
        </button>
        <button
          onClick={() => { if (!selected.length) return; setSession((s) => ({...s, answers:{...s.answers,[cq.id]:selected}, selected:[], step:s.step+1})); }}
          disabled={!selected.length}
          className="font-semibold text-sm px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: 'linear-gradient(180deg,#ff9070 0%,#ff7a59 45%,#e05535 100%)', color: '#fff', boxShadow: '0 1px 0 0 rgba(255,255,255,0.2) inset,0 -1px 0 0 rgba(0,0,0,0.2) inset,0 4px 12px rgba(255,122,89,0.25)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {step === QS.length - 1 ? t.seeResults : t.next} {lang === 'he' ? '←' : '→'}
        </button>
      </div>
    </div>
  );
}
