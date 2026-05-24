import { useState } from 'react';

type Lang = 'he' | 'en' | 'es' | 'ru';
type T = { back: string; next: string; seeResults: string; startOver: string; yourScore: string; topFindings: string; quickWins: string; nextActions: string; relatedTools: string; newsletterTitle: string; newsletterPlaceholder: string; newsletterCta: string; newsletterDisclaimer: string; lang: string };

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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
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
    setAnswers((p) => ({ ...p, [cq.id]: cq.multi ? selected : selected[0] }));
    setSelected([]);
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    const pq = QS[step - 1];
    const prev = answers[pq.id];
    setSelected(Array.isArray(prev) ? prev : prev ? [prev] : []);
    setStep((s) => s - 1);
  }

  const weakPoints: string[] = [];
  const followup = answers.followup as string;
  const contact = answers.contact as string;
  if (followup && FIXES[followup]) weakPoints.push(FIXES[followup] as any);
  if (contact && FIXES[contact]) weakPoints.push(FIXES[contact] as any);

  const flowSteps = {
    he: ['מקור ליד', 'יצירת קשר', 'טיפול ראשוני', 'מעקב', 'סגירה'],
    en: ['Lead Source', 'First Contact', 'Initial Handling', 'Follow-up', 'Close'],
    es: ['Fuente de Lead', 'Primer Contacto', 'Manejo Inicial', 'Seguimiento', 'Cierre'],
    ru: ['Источник лида', 'Первый контакт', 'Первичная обработка', 'Follow-up', 'Закрытие'],
  };

  if (isResult) {
    return (
      <div className="space-y-6">
        {/* Flow diagram */}
        <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8 overflow-x-auto">
          <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-5">{t.yourScore}</p>
          <div className="flex items-center gap-2 min-w-max">
            {(flowSteps[lang as Lang] ?? flowSteps.en).map((s, i, arr) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono ${i === 2 && (followup === 'nothing' || followup === 'manual') ? 'border-[#FF7A59]/50 bg-[#FF7A59]/10 text-[#FF7A59]' : 'border-[rgba(244,241,234,0.14)] bg-[#1E2530] text-[#A7AFBA]'}`}>
                  {s}
                </div>
                {i < arr.length - 1 && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A7AFBA]/40 flex-shrink-0">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {weakPoints.length > 0 && (
          <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6">
            <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-4">{t.quickWins}</p>
            <ul className="space-y-2">
              {weakPoints.map((w: any, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#F4F1EA]">
                  <span className="text-[#FF7A59] flex-shrink-0 mt-0.5">⚠</span>
                  {gl(w, lang)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button onClick={() => { setStep(0); setAnswers({}); setSelected([]); }} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] font-mono transition-colors">↺ {t.startOver}</button>
          <a href={`/${lang}/tools/automation-finder`} className="text-sm text-[#A7AFBA] hover:text-[#C7FF4A] font-mono no-underline transition-colors">{t.relatedTools} →</a>
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
        <div className="h-1.5 rounded-full bg-[#1E2530] overflow-hidden"><div className="h-full rounded-full bg-[#C7FF4A] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8">
        <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-2">{gl(cq.q, lang)}</h2>
        {cq.multi && <p className="text-xs text-[#A7AFBA]/60 font-mono mb-5">{lang === 'he' ? 'בחר הכל שרלוונטי' : lang === 'ru' ? 'Выберите все подходящие' : lang === 'es' ? 'Selecciona todo lo que aplique' : 'Select all that apply'}</p>}
        <div className="space-y-2">
          {cq.opts.map((o: any) => (
            <button key={o.v} onClick={() => toggle(o.v)} className={`w-full text-start px-4 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${selected.includes(o.v) ? 'border-[#C7FF4A]/60 bg-[#C7FF4A]/8 text-[#F4F1EA]' : 'border-[rgba(244,241,234,0.14)] bg-[#1E2530] text-[#A7AFBA] hover:text-[#F4F1EA] hover:border-[rgba(244,241,234,0.25)]'}`}>
              {cq.multi && (
                <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${selected.includes(o.v) ? 'bg-[#C7FF4A] border-[#C7FF4A]' : 'border-[rgba(244,241,234,0.3)]'}`}>
                  {selected.includes(o.v) && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0E1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
              )}
              <span className="flex-1">{gl(o.l, lang)}</span>
              {o.weak && <span className="text-[10px] font-mono text-[#FF7A59] border border-[#FF7A59]/30 px-1.5 py-0.5 rounded flex-shrink-0">{lang === 'he' ? 'סיכון' : lang === 'ru' ? 'риск' : lang === 'es' ? 'riesgo' : 'risk'}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={back} disabled={step === 0} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] disabled:opacity-30 font-mono transition-colors">← {t.back}</button>
        <button onClick={next} disabled={!selected.length} className="bg-[#C7FF4A] text-[#0E1117] font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-[#C7FF4A]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          {step === QS.length - 1 ? t.seeResults : t.next} →
        </button>
      </div>
    </div>
  );
}
