import { useState, useEffect } from 'react';
import ToolResult, { useToolSession, trackEvent } from './ToolResult';

type Lang = 'he' | 'en' | 'es' | 'ru';
type T = { back: string; next: string; seeResults: string; startOver: string; yourScore: string; topFindings: string; quickWins: string; nextActions: string; relatedTools: string; newsletterTitle: string; newsletterPlaceholder: string; newsletterCta: string; newsletterDisclaimer: string; lang: string };

interface GeoData { country_code: string; country_name: string; currency: string; }

async function fetchGeo(): Promise<GeoData | null> {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return null;
    const d = await res.json();
    return { country_code: d.country_code ?? '', country_name: d.country_name ?? '', currency: d.currency ?? 'USD' };
  } catch { return null; }
}

function getCrmForRegion(geo: GeoData | null): { name: string; url: string } {
  if (!geo) return { name: 'HubSpot CRM', url: 'https://www.hubspot.com/products/crm' };
  const cc = geo.country_code;
  if (cc === 'IL') return { name: 'Monday CRM', url: 'https://monday.com/crm' };
  if (['DE', 'AT', 'CH', 'NL', 'BE'].includes(cc)) return { name: 'Pipedrive', url: 'https://www.pipedrive.com' };
  if (['RU', 'UA', 'KZ', 'BY'].includes(cc)) return { name: 'Bitrix24', url: 'https://www.bitrix24.com' };
  if (['MX', 'CO', 'AR', 'CL', 'PE', 'ES'].includes(cc)) return { name: 'Zoho CRM', url: 'https://www.zoho.com/crm' };
  return { name: 'HubSpot CRM', url: 'https://www.hubspot.com/products/crm' };
}

function gl(o: Record<string, string>, l: string) { return o[l] ?? o['en'] ?? ''; }

const QS = [
  {
    id: 'source',
    q: { he: 'מאיפה מגיעים רוב הלידים שלך?', en: 'Where do most of your leads come from?', es: '¿De dónde provienen la mayoría de tus leads?', ru: 'Откуда приходит большинство ваших лидов?' },
    multi: true,
    opts: [
      { v: 'referral', l: { he: 'המלצות', en: 'Referrals', es: 'Referencias', ru: 'Рекомендации' } },
      { v: 'website', l: { he: 'אתר', en: 'Website', es: 'Sitio web', ru: 'Сайт' } },
      { v: 'social', l: { he: 'רשתות חברתיות', en: 'Social media', es: 'Redes sociales', ru: 'Соцсети' } },
      { v: 'ads', l: { he: 'פרסום ממומן', en: 'Paid ads', es: 'Publicidad pagada', ru: 'Платная реклама' } },
      { v: 'cold', l: { he: 'פנייה יוצאת', en: 'Outbound / cold', es: 'Salida / frío', ru: 'Исходящий / холодный' } },
    ],
  },
  {
    id: 'contact',
    q: { he: 'כיצד לידים מתחברים אליך לראשונה?', en: 'How do leads first contact you?', es: '¿Cómo contactan los leads por primera vez?', ru: 'Как лиды впервые связываются с вами?' },
    multi: false,
    opts: [
      { v: 'whatsapp', l: { he: 'WhatsApp', en: 'WhatsApp', es: 'WhatsApp', ru: 'WhatsApp' } },
      { v: 'phone', l: { he: 'טלפון', en: 'Phone call', es: 'Llamada telefónica', ru: 'Телефонный звонок' } },
      { v: 'email', l: { he: 'אימייל', en: 'Email', es: 'Email', ru: 'Email' } },
      { v: 'form', l: { he: 'טופס באתר', en: 'Website form', es: 'Formulario web', ru: 'Форма на сайте' } },
      { v: 'social_dm', l: { he: 'DM ברשתות חברתיות', en: 'Social media DM', es: 'DM en redes sociales', ru: 'DM в соцсетях' } },
    ],
  },
  {
    id: 'followup',
    q: { he: 'מה קורה אחרי שליד יוצר קשר?', en: 'What happens after a lead contacts you?', es: '¿Qué pasa después de que un lead contacta?', ru: 'Что происходит после того, как лид связывается с вами?' },
    multi: false,
    opts: [
      { v: 'nothing', l: { he: 'לפעמים שוכחים', en: 'Sometimes forgotten', es: 'A veces se olvida', ru: 'Иногда забывается' }, weak: true },
      { v: 'manual', l: { he: 'מעקב ידני — תלוי בזיכרון', en: 'Manual follow-up — depends on memory', es: 'Seguimiento manual — depende de la memoria', ru: 'Ручной follow-up — зависит от памяти' }, weak: true },
      { v: 'crm', l: { he: 'מוזן ל-CRM ומעקב', en: 'Logged in CRM and tracked', es: 'Registrado en CRM y seguido', ru: 'Занесён в CRM и отслеживается' }, weak: false },
      { v: 'automated', l: { he: 'אוטומציה מלאה — אישור + מעקב', en: 'Fully automated — confirmation + follow-up', es: 'Totalmente automatizado — confirmación + seguimiento', ru: 'Полностью автоматизировано — подтверждение + follow-up' }, weak: false },
    ],
  },
  {
    id: 'close',
    q: { he: 'כמה זמן בדרך כלל לסגור ליד?', en: 'How long does it typically take to close a lead?', es: '¿Cuánto tiempo suele llevar cerrar un lead?', ru: 'Сколько обычно занимает закрытие лида?' },
    multi: false,
    opts: [
      { v: 'days', l: { he: 'כמה ימים', en: 'A few days', es: 'Unos días', ru: 'Несколько дней' } },
      { v: 'week', l: { he: 'שבוע', en: 'About a week', es: 'Aproximadamente una semana', ru: 'Около недели' } },
      { v: 'weeks', l: { he: '2–4 שבועות', en: '2–4 weeks', es: '2–4 semanas', ru: '2–4 недели' } },
      { v: 'months', l: { he: 'חודש+', en: 'A month or more', es: 'Un mes o más', ru: 'Месяц и более' } },
    ],
  },
];

const FIXES: Record<string, Record<string, string>> = {
  nothing: { he: 'הגדר תשובה אוטומטית מיידית ב-WhatsApp/אימייל', en: 'Set up an instant auto-reply via WhatsApp/email', es: 'Configura una respuesta automática instantánea por WhatsApp/email', ru: 'Настройте мгновенный авто-ответ через WhatsApp/email' },
  manual: { he: 'הגדר תזכורת אוטומטית ב-CRM — לא תלוי בזיכרון', en: 'Set up CRM auto-reminders — remove memory dependency', es: 'Configura recordatorios automáticos en CRM — elimina la dependencia de la memoria', ru: 'Настройте авто-напоминания в CRM — устраните зависимость от памяти' },
  whatsapp: { he: 'הוסף קישור WhatsApp Business עם ברכת אוטומציה', en: 'Add WhatsApp Business link with automation greeting', es: 'Agrega enlace de WhatsApp Business con saludo automático', ru: 'Добавьте ссылку WhatsApp Business с автоматическим приветствием' },
  phone: { he: 'הוסף טופס קליטה לפני שיחות — חסוך זמן שיחה', en: 'Add intake form before calls — save call time', es: 'Agrega formulario de admisión antes de las llamadas', ru: 'Добавьте форму приёма до звонков — сэкономьте время' },
};

export default function LeadFlowMapper({ t }: { t: T }) {
  const lang = (t.lang || 'en') as Lang;
  const [session, setSession, clearSession] = useToolSession('lead-flow', {
    step: 0,
    answers: {} as Record<string, string | string[]>,
    selected: [] as string[],
  });
  const { step, answers, selected } = session;

  const [geo, setGeo] = useState<GeoData | null>(null);

  const isResult = step >= QS.length;
  const cq = QS[step];

  const followup = answers.followup as string;
  const contact = answers.contact as string;

  const weakPoints: Record<string, string>[] = [];
  if (followup && FIXES[followup]) weakPoints.push(FIXES[followup]);
  if (contact && FIXES[contact]) weakPoints.push(FIXES[contact]);

  const flowSteps = {
    he: ['מקור ליד', 'יצירת קשר', 'טיפול ראשוני', 'מעקב', 'סגירה'],
    en: ['Lead Source', 'First Contact', 'Initial Handling', 'Follow-up', 'Close'],
    es: ['Fuente de Lead', 'Primer Contacto', 'Manejo Inicial', 'Seguimiento', 'Cierre'],
    ru: ['Источник лида', 'Первый контакт', 'Первичная обработка', 'Follow-up', 'Закрытие'],
  };

  const selectAllLabel = { he: 'בחר הכל שרלוונטי', en: 'Select all that apply', es: 'Selecciona todo lo que aplique', ru: 'Выберите все подходящие' };
  const riskLabel = { he: 'סיכון', en: 'risk', es: 'riesgo', ru: 'риск' };

  const nextActions = [
    (followup === 'nothing' || followup === 'manual') && { he: 'בנה Pipeline ראשוני ב-CRM עם 4 שלבים: ליד חדש → מגע → הצעה → סגירה', en: 'Build a basic CRM Pipeline: new lead → contacted → proposal → closed', es: 'Construye un Pipeline básico en CRM con 4 etapas', ru: 'Создайте базовый Pipeline в CRM с 4 этапами' },
    contact === 'whatsapp' && { he: 'הגדר WhatsApp Business API עם תגובה אוטומטית תוך 5 דקות', en: 'Set up WhatsApp Business API with 5-minute auto-reply', es: 'Configura WhatsApp Business API con respuesta automática en 5 minutos', ru: 'Настройте WhatsApp Business API с авто-ответом за 5 минут' },
    { he: 'הוסף 3 שאלות קוואליפיקציה לטופס הקליטה שלך', en: 'Add 3 qualification questions to your intake form', es: 'Agrega 3 preguntas de calificación a tu formulario de admisión', ru: 'Добавьте 3 квалификационных вопроса в форму приёма' },
  ].filter(Boolean).slice(0, 3).map((a: any) => gl(a, lang));

  useEffect(() => {
    if (step === 0 && Object.keys(answers).length === 0) trackEvent('tool_started', { tool: 'lead-flow', lang });
  }, []);
  useEffect(() => {
    if (!isResult) return;
    trackEvent('tool_completed', { tool: 'lead-flow', lang });
    fetchGeo().then(setGeo);
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
        toolId="lead-flow"
        t={t}
        answers={answers as Record<string, unknown>}
        quickWins={weakPoints.map((w) => gl(w, lang))}
        nextActions={nextActions}
        onReset={clearSession}
        scoreBlock={
          <div>
            <div className="mb-5">
              <p className="font-mono text-xs tracking-widest uppercase text-shift-accent mb-4">{t.yourScore}</p>
              <div className="flex flex-col md:flex-row items-center gap-2 w-full">
                {(flowSteps[lang as Lang] ?? flowSteps.en).map((s, i, arr) => (
                  <div key={i} className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
                    <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono w-full text-center md:w-auto ${
                      i === 2 && (followup === 'nothing' || followup === 'manual')
                        ? 'border-shift-warm/50 bg-shift-warm/10 text-shift-warm'
                        : 'border-shift-line bg-white/[0.04] text-shift-muted'
                    }`}>{s}</div>
                    {i < arr.length - 1 && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-shift-muted/40 flex-shrink-0 rotate-90 md:rotate-0 md:rtl:rotate-180 my-1 md:my-0">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {(() => {
              const crm = getCrmForRegion(geo);
              const crmLabel: Record<Lang, string> = { he: 'CRM מומלץ לאזורך', en: 'Recommended CRM for your region', es: 'CRM recomendado para tu región', ru: 'Рекомендуемый CRM для вашего региона' };
              return (
                <div className="border-t border-shift-line pt-4">
                  <p className="font-mono text-xs text-shift-muted/60 uppercase tracking-widest mb-2">{crmLabel[lang]}{geo ? ` (${geo.country_name})` : ''}</p>
                  <a href={crm.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-shift-accent hover:text-shift-accent/80 transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shift-accent focus-visible:ring-offset-2 focus-visible:ring-offset-shift-bg rounded"
                  >
                    {crm.name}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                </div>
              );
            })()}
          </div>
        }
      />
    );
  }

  const progress = Math.round((step / QS.length) * 100);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-shift-muted"><span>{step + 1} / {QS.length}</span><span>{progress}%</span></div>
        <div className="shift-progress-track">
          <div className="shift-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="shift-card">
        <h2 className="font-heading font-semibold text-xl text-shift-text mb-2">{gl(cq.q, lang)}</h2>
        {cq.multi && <p className="text-xs text-shift-muted/60 font-mono mb-5">{gl(selectAllLabel, lang)}</p>}
        <div className="space-y-2">
          {cq.opts.map((o: any) => {
            const isSelected = selected.includes(o.v);
            return (
              <button key={o.v} onClick={() => toggle(o.v)}
                className={`w-full text-start px-4 py-3.5 rounded-xl text-sm transition-all duration-150 flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shift-accent focus-visible:ring-offset-2 focus-visible:ring-offset-shift-bg ${
                  isSelected ? 'shift-option-btn-selected' : 'shift-option-btn'
                }`}
              >
                {cq.multi && (
                  <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-shift-accent border-shift-accent' : 'border-shift-text/25'
                  }`}>
                    {isSelected && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0E1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </span>
                )}
                <span className="flex-1">{gl(o.l, lang)}</span>
                {o.weak && <span className="text-[10px] font-mono text-shift-warm border border-shift-warm/30 px-1.5 py-0.5 rounded flex-shrink-0">{gl(riskLabel, lang)}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (step === 0) return; const pq = QS[step-1]; const prev = answers[pq.id]; setSession((s) => ({...s, step:s.step-1, selected: Array.isArray(prev) ? prev : prev ? [prev as string] : []})); }}
          disabled={step === 0} className="text-sm text-shift-muted hover:text-shift-text disabled:opacity-30 disabled:cursor-not-allowed font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shift-accent focus-visible:ring-offset-2 focus-visible:ring-offset-shift-bg rounded px-1">{lang === 'he' ? '→' : '←'} {t.back}
        </button>
        <button
          onClick={() => { if (!selected.length) return; setSession((s) => ({...s, answers:{...s.answers,[cq.id]: cq.multi ? selected : selected[0]}, selected:[], step:s.step+1})); }}
          disabled={!selected.length}
          className="shift-btn-primary"
        >
          {step === QS.length - 1 ? t.seeResults : t.next} {lang === 'he' ? '←' : '→'}
        </button>
      </div>
    </div>
  );
}
