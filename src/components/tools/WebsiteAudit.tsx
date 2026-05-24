import { useState } from 'react';

type Lang = 'he' | 'en' | 'es' | 'ru';

interface Props {
  t: { back: string; next: string; seeResults: string; startOver: string; yourScore: string; topFindings: string; quickWins: string; nextActions: string; relatedTools: string; newsletterTitle: string; newsletterPlaceholder: string; newsletterCta: string; newsletterDisclaimer: string; lang: string };
}

function gl(obj: Record<string, string>, lang: string) { return obj[lang] ?? obj['en'] ?? ''; }

const QUESTIONS = [
  {
    id: 'cta',
    q: { he: 'האם יש לך קריאה לפעולה ברורה בדף הבית?', en: 'Do you have a clear call-to-action on your homepage?', es: '¿Tienes una llamada a la acción clara en tu página de inicio?', ru: 'Есть ли у вас чёткий призыв к действию на главной странице?' },
    opts: [
      { v: 'no', l: { he: 'לא', en: 'No', es: 'No', ru: 'Нет' }, s: 0 },
      { v: 'vague', l: { he: 'יש משהו, לא ברור', en: 'Something, but vague', es: 'Algo, pero vago', ru: 'Что-то есть, но нечёткое' }, s: 5 },
      { v: 'yes', l: { he: 'כן, CTA ברור', en: 'Yes, clear CTA', es: 'Sí, CTA claro', ru: 'Да, чёткий CTA' }, s: 15 },
      { v: 'tested', l: { he: 'כן, ונבדק עם A/B', en: 'Yes, A/B tested', es: 'Sí, probado con A/B', ru: 'Да, A/B тестировался' }, s: 20 },
    ],
  },
  {
    id: 'speed',
    q: { he: 'כמה מהר האתר שלך נטען?', en: 'How fast does your website load?', es: '¿Qué tan rápido carga tu sitio web?', ru: 'Насколько быстро загружается ваш сайт?' },
    opts: [
      { v: 'slow', l: { he: 'איטי (מעל 5 שניות)', en: 'Slow (over 5 seconds)', es: 'Lento (más de 5 segundos)', ru: 'Медленно (более 5 секунд)' }, s: 0 },
      { v: 'ok', l: { he: 'בסדר (3–5 שניות)', en: 'OK (3–5 seconds)', es: 'Bien (3–5 segundos)', ru: 'Нормально (3–5 секунд)' }, s: 5 },
      { v: 'fast', l: { he: 'מהיר (מתחת ל-3 שניות)', en: 'Fast (under 3 seconds)', es: 'Rápido (menos de 3 segundos)', ru: 'Быстро (менее 3 секунд)' }, s: 10 },
      { v: 'optimised', l: { he: 'אופטימיזציה מלאה', en: 'Fully optimised', es: 'Completamente optimizado', ru: 'Полностью оптимизирован' }, s: 20 },
    ],
  },
  {
    id: 'leads',
    q: { he: 'האתר קולט לידים?', en: 'Does your website collect leads?', es: '¿Tu sitio web captura leads?', ru: 'Собирает ли ваш сайт лиды?' },
    opts: [
      { v: 'no', l: { he: 'אין טופס', en: 'No form', es: 'Sin formulario', ru: 'Нет формы' }, s: 0 },
      { v: 'basic', l: { he: 'טופס פשוט לאימייל', en: 'Basic email form', es: 'Formulario de email básico', ru: 'Базовая форма email' }, s: 5 },
      { v: 'structured', l: { he: 'טופס מובנה עם שאלות', en: 'Structured form with questions', es: 'Formulario estructurado con preguntas', ru: 'Структурированная форма с вопросами' }, s: 12 },
      { v: 'crm', l: { he: 'מחובר ל-CRM + מעקב', en: 'Connected to CRM + tracking', es: 'Conectado a CRM + seguimiento', ru: 'Подключён к CRM + отслеживание' }, s: 20 },
    ],
  },
  {
    id: 'analytics',
    q: { he: 'יש לך אנליטיקס מוגדר?', en: 'Do you have analytics set up?', es: '¿Tienes analytics configurado?', ru: 'У вас настроена аналитика?' },
    opts: [
      { v: 'no', l: { he: 'לא', en: 'No', es: 'No', ru: 'Нет' }, s: 0 },
      { v: 'basic', l: { he: 'Google Analytics בלבד', en: 'Basic Google Analytics only', es: 'Solo Google Analytics básico', ru: 'Только базовый Google Analytics' }, s: 5 },
      { v: 'events', l: { he: 'אנליטיקס עם מעקב אחר אירועים', en: 'Analytics with event tracking', es: 'Analytics con seguimiento de eventos', ru: 'Аналитика с отслеживанием событий' }, s: 15 },
      { v: 'full', l: { he: 'מדדים מלאים + המרות + הפניות', en: 'Full funnel + conversions + funnels', es: 'Embudo completo + conversiones', ru: 'Полная воронка + конверсии' }, s: 20 },
    ],
  },
  {
    id: 'mobile',
    q: { he: 'האתר מותאם לנייד?', en: 'Is your website mobile-optimised?', es: '¿Tu sitio web está optimizado para móvil?', ru: 'Ваш сайт оптимизирован для мобильных?' },
    opts: [
      { v: 'no', l: { he: 'לא ממש', en: 'Not really', es: 'No mucho', ru: 'Не очень' }, s: 0 },
      { v: 'sort_of', l: { he: 'עובד אבל לא אופטימלי', en: 'Works but not optimal', es: 'Funciona pero no es óptimo', ru: 'Работает, но не оптимально' }, s: 5 },
      { v: 'yes', l: { he: 'כן, מותאם היטב לנייד', en: 'Yes, mobile-first design', es: 'Sí, diseño mobile-first', ru: 'Да, дизайн mobile-first' }, s: 20 },
    ],
  },
];

const LEVEL_LABELS = [
  { min: 0, max: 24, label: { he: 'אתר פרספקטוס', en: 'Brochure Site', es: 'Sitio Folleto', ru: 'Сайт-брошюра' }, color: '#FF7A59' },
  { min: 25, max: 54, label: { he: 'אתר לידים', en: 'Lead Site', es: 'Sitio de Leads', ru: 'Лид-сайт' }, color: '#6EE7F9' },
  { min: 55, max: 79, label: { he: 'מערכת אתר', en: 'System Site', es: 'Sitio Sistema', ru: 'Системный сайт' }, color: '#C7FF4A' },
  { min: 80, max: 100, label: { he: 'שכבת תפעול', en: 'Operational Layer', es: 'Capa Operacional', ru: 'Операционный слой' }, color: '#C7FF4A' },
];

export default function WebsiteAudit({ t }: Props) {
  const lang = (t.lang || 'en') as Lang;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const isResult = step >= QUESTIONS.length;
  const cq = QUESTIONS[step];
  const score = Math.round(Object.entries(answers).reduce((acc, [k, v]) => {
    const q = QUESTIONS.find((q) => q.id === k);
    const opt = q?.opts.find((o) => o.v === v);
    return acc + (opt?.s ?? 0);
  }, 0) / 75 * 100);
  const level = LEVEL_LABELS.find((l) => score >= l.min && score <= l.max) ?? LEVEL_LABELS[0];

  function next() {
    if (!selected) return;
    setAnswers((p) => ({ ...p, [cq.id]: selected }));
    setSelected('');
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    const pq = QUESTIONS[step - 1];
    setSelected(answers[pq.id] || '');
    setStep((s) => s - 1);
  }

  if (isResult) {
    return (
      <div className="space-y-6">
        <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8">
          <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: level.color }}>{t.yourScore}</p>
          <div className="flex items-end gap-4 mb-1">
            <span className="font-['Inter_Tight',system-ui,sans-serif] font-bold text-5xl text-[#F4F1EA]">{score}</span>
            <span className="font-semibold mb-2" style={{ color: level.color }}>{gl(level.label, lang)}</span>
          </div>
          <div className="h-2 rounded-full bg-[#1E2530] overflow-hidden mt-3">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: level.color }} />
          </div>
        </div>

        <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8">
          <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-4">{t.quickWins}</p>
          <ul className="space-y-2">
            {[
              answers.cta !== 'tested' && { he: 'ערוך A/B טסט על ה-CTA הראשי', en: 'Run an A/B test on your primary CTA', es: 'Haz un A/B test en tu CTA principal', ru: 'Проведите A/B тест основного CTA' },
              answers.speed === 'slow' && { he: 'שפר מהירות אתר — כל שניית עיכוב עולה ב-7% המרה', en: 'Improve load speed — every second costs 7% conversion', es: 'Mejora la velocidad — cada segundo cuesta 7% de conversión', ru: 'Улучшите скорость — каждая секунда стоит 7% конверсии' },
              answers.leads !== 'crm' && { he: 'חבר טופס ל-CRM ואוטומט מעקב', en: 'Connect form to CRM and automate follow-up', es: 'Conecta formulario al CRM y automatiza el seguimiento', ru: 'Подключите форму к CRM и автоматизируйте follow-up' },
              answers.analytics === 'no' && { he: 'התקן Google Analytics 4 עם מעקב אחר אירועים', en: 'Install GA4 with event tracking', es: 'Instala GA4 con seguimiento de eventos', ru: 'Установите GA4 с отслеживанием событий' },
            ].filter(Boolean).slice(0, 3).map((w: any, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#F4F1EA]">
                <span className="w-5 h-5 rounded-full bg-[#C7FF4A]/10 border border-[#C7FF4A]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="font-mono text-[10px] text-[#C7FF4A]">{i + 1}</span>
                </span>
                {gl(w, lang)}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => { setStep(0); setAnswers({}); setSelected(''); }} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] transition-colors font-mono">
            ↺ {t.startOver}
          </button>
          <a href={`/${lang}/tools/business-audit`} className="text-sm text-[#A7AFBA] hover:text-[#C7FF4A] transition-colors no-underline font-mono">
            {t.relatedTools} →
          </a>
        </div>

        <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6">
          <p className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-[#F4F1EA] mb-3">{t.newsletterTitle}</p>
          {subscribed ? <p className="text-sm text-[#C7FF4A]">✓</p> : (
            <div className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.newsletterPlaceholder} className="flex-1 bg-[#1E2530] border border-[rgba(244,241,234,0.14)] rounded-xl px-4 py-2.5 text-sm text-[#F4F1EA] placeholder-[#A7AFBA]/50 outline-none focus:border-[rgba(199,255,74,0.4)]" />
              <button onClick={() => email && setSubscribed(true)} className="bg-[#C7FF4A] text-[#0E1117] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#C7FF4A]/90 transition-colors flex-shrink-0">{t.newsletterCta}</button>
            </div>
          )}
          <p className="mt-2 text-xs text-[#A7AFBA]/60">{t.newsletterDisclaimer}</p>
        </div>
      </div>
    );
  }

  const progress = Math.round((step / QUESTIONS.length) * 100);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-[#A7AFBA]"><span>{step + 1} / {QUESTIONS.length}</span><span>{progress}%</span></div>
        <div className="h-1.5 rounded-full bg-[#1E2530] overflow-hidden"><div className="h-full rounded-full bg-[#6EE7F9] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8">
        <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-6">{gl(cq.q, lang)}</h2>
        <div className="space-y-2">
          {cq.opts.map((o) => (
            <button key={o.v} onClick={() => setSelected(o.v)} className={`w-full text-start px-4 py-3.5 rounded-xl border text-sm transition-all ${selected === o.v ? 'border-[#6EE7F9]/60 bg-[#6EE7F9]/8 text-[#F4F1EA]' : 'border-[rgba(244,241,234,0.14)] bg-[#1E2530] text-[#A7AFBA] hover:text-[#F4F1EA] hover:border-[rgba(244,241,234,0.25)]'}`}>
              {gl(o.l, lang)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={back} disabled={step === 0} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] disabled:opacity-30 transition-colors font-mono">← {t.back}</button>
        <button onClick={next} disabled={!selected} className="bg-[#6EE7F9] text-[#0E1117] font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-[#6EE7F9]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          {step === QUESTIONS.length - 1 ? t.seeResults : t.next} →
        </button>
      </div>
    </div>
  );
}
