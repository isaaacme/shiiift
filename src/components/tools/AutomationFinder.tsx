import { useState } from 'react';

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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const isResult = step >= QS.length;
  const cq = QS[step];

  function toggle(v: string) {
    if (cq?.multi) {
      setSelected((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]);
    } else {
      setSelected([v]);
    }
  }

  function next() {
    if (!selected.length) return;
    setAnswers((p) => ({ ...p, [cq.id]: selected }));
    setSelected([]);
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    const pq = QS[step - 1];
    setSelected(answers[pq.id] || []);
    setStep((s) => s - 1);
  }

  const tasks = answers.tasks || [];
  const hours = HOURS_MAP[answers.hours?.[0]] || 0;
  const candidates = tasks.map((t) => CANDIDATES[t]).filter(Boolean);

  if (isResult) {
    return (
      <div className="space-y-6">
        <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8">
          <p className="font-mono text-xs tracking-widest uppercase text-[#FF7A59] mb-3">{t.yourScore}</p>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-['Inter_Tight',system-ui,sans-serif] font-bold text-5xl text-[#F4F1EA]">{hours}</span>
            <span className="text-[#A7AFBA] text-sm">{lang === 'he' ? 'שעות/שבוע ניתנות לשחזור' : lang === 'ru' ? 'часов/неделю восстановимо' : lang === 'es' ? 'horas/semana recuperables' : 'hours/week recoverable'}</span>
          </div>
        </div>

        {candidates.length > 0 && (
          <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8">
            <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-4">{t.quickWins}</p>
            <ul className="space-y-2">
              {candidates.map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#F4F1EA]">
                  <span className="w-5 h-5 rounded-full bg-[#FF7A59]/10 border border-[#FF7A59]/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-mono text-[#FF7A59]">{i + 1}</span>
                  {gl(c, lang)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button onClick={() => { setStep(0); setAnswers({}); setSelected([]); }} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] font-mono transition-colors">↺ {t.startOver}</button>
          <a href={`/${lang}/tools/lead-flow`} className="text-sm text-[#A7AFBA] hover:text-[#C7FF4A] font-mono no-underline transition-colors">{t.relatedTools} →</a>
        </div>

        <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6">
          <p className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-[#F4F1EA] mb-3">{t.newsletterTitle}</p>
          {subscribed ? <p className="text-sm text-[#C7FF4A]">✓</p> : (
            <div className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.newsletterPlaceholder} className="flex-1 bg-[#1E2530] border border-[rgba(244,241,234,0.14)] rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] outline-none focus:border-[rgba(199,255,74,0.4)]" />
              <button onClick={() => email && setSubscribed(true)} className="bg-[#C7FF4A] text-[#0E1117] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#C7FF4A]/90 flex-shrink-0 transition-colors">{t.newsletterCta}</button>
            </div>
          )}
          <p className="mt-2 text-xs text-[#A7AFBA]/60">{t.newsletterDisclaimer}</p>
        </div>
      </div>
    );
  }

  const progress = Math.round((step / QS.length) * 100);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-[#A7AFBA]"><span>{step + 1} / {QS.length}</span><span>{progress}%</span></div>
        <div className="h-1.5 rounded-full bg-[#1E2530] overflow-hidden"><div className="h-full rounded-full bg-[#FF7A59] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8">
        <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-2">{gl(cq.q, lang)}</h2>
        {cq.multi && <p className="text-xs text-[#A7AFBA]/60 font-mono mb-5">{lang === 'he' ? 'בחר כמה שרלוונטי' : lang === 'ru' ? 'Выберите все подходящие' : lang === 'es' ? 'Selecciona todo lo que aplique' : 'Select all that apply'}</p>}
        <div className="space-y-2">
          {cq.opts.map((o) => (
            <button key={o.v} onClick={() => toggle(o.v)} className={`w-full text-start px-4 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${selected.includes(o.v) ? 'border-[#FF7A59]/60 bg-[#FF7A59]/8 text-[#F4F1EA]' : 'border-[rgba(244,241,234,0.14)] bg-[#1E2530] text-[#A7AFBA] hover:text-[#F4F1EA] hover:border-[rgba(244,241,234,0.25)]'}`}>
              <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${selected.includes(o.v) ? 'bg-[#FF7A59] border-[#FF7A59]' : 'border-[rgba(244,241,234,0.3)]'}`}>
                {selected.includes(o.v) && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0E1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </span>
              {gl(o.l, lang)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={back} disabled={step === 0} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] disabled:opacity-30 font-mono transition-colors">← {t.back}</button>
        <button onClick={next} disabled={!selected.length} className="bg-[#FF7A59] text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-[#FF7A59]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          {step === QS.length - 1 ? t.seeResults : t.next} →
        </button>
      </div>
    </div>
  );
}
