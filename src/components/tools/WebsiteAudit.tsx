import { useState, useEffect } from 'react';
import ToolResult from './ToolResult';
import { useToolSession, trackEvent } from './useToolSession';

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
  const [session, setSession, clearSession] = useToolSession('website-audit', { step: 0, answers: {} as Record<string, string>, selected: '' });
  const { step, answers, selected } = session;

  const isResult = step >= QUESTIONS.length;
  const cq = QUESTIONS[step];
  const score = Math.round(Object.entries(answers).reduce((acc, [k, v]) => {
    const q = QUESTIONS.find((q) => q.id === k);
    const opt = q?.opts.find((o) => o.v === v);
    return acc + (opt?.s ?? 0);
  }, 0) / 75 * 100);
  const level = LEVEL_LABELS.find((l) => score >= l.min && score <= l.max) ?? LEVEL_LABELS[0];

  useEffect(() => {
    if (step === 0 && Object.keys(answers).length === 0) trackEvent('tool_started', { tool: 'website-audit', lang });
  }, []);
  useEffect(() => {
    if (isResult) trackEvent('tool_completed', { tool: 'website-audit', lang, score: String(score) });
  }, [isResult]);

  const wins = [
    answers.cta !== 'tested' && { he: 'ערוך A/B טסט על ה-CTA הראשי', en: 'Run an A/B test on your primary CTA', es: 'Haz un A/B test en tu CTA principal', ru: 'Проведите A/B тест основного CTA' },
    answers.speed === 'slow' && { he: 'שפר מהירות אתר — כל שניית עיכוב עולה ב-7% המרה', en: 'Improve load speed — every second costs 7% conversion', es: 'Mejora la velocidad — cada segundo cuesta 7% de conversión', ru: 'Улучшите скорость — каждая секунда стоит 7% конверсии' },
    answers.leads !== 'crm' && { he: 'חבר טופס ל-CRM ואוטומט מעקב', en: 'Connect form to CRM and automate follow-up', es: 'Conecta formulario al CRM y automatiza el seguimiento', ru: 'Подключите форму к CRM и автоматизируйте follow-up' },
    answers.analytics === 'no' && { he: 'התקן Google Analytics 4 עם מעקב אחר אירועים', en: 'Install GA4 with event tracking', es: 'Instala GA4 con seguimiento de eventos', ru: 'Установите GA4 с отслеживанием событий' },
  ].filter(Boolean).slice(0, 3).map((w: any) => gl(w, lang));

  const nextActions = score < 40
    ? [
        { he: 'הוסף CTA ראשי ברור לדף הבית', en: 'Add a single clear primary CTA to your homepage', es: 'Agrega un CTA principal claro a tu página de inicio', ru: 'Добавьте чёткий основной CTA на главную страницу' },
        { he: 'חבר טופס יצירת קשר ל-CRM עם מעקב אוטומטי', en: 'Connect contact form to CRM with auto follow-up', es: 'Conecta formulario al CRM con seguimiento automático', ru: 'Подключите форму к CRM с авто-follow-up' },
      ].map((a) => gl(a, lang))
    : [
        { he: 'הגדר מעקב המרות ב-GA4 ובנה דוח שבועי', en: 'Set up GA4 conversion tracking and build a weekly report', es: 'Configura seguimiento de conversiones en GA4 y crea informe semanal', ru: 'Настройте отслеживание конверсий в GA4 и еженедельный отчёт' },
        { he: 'בחן הוספת צ\'אט/בוט לדף הבית לייצור לידים', en: 'Consider adding a chat/bot to homepage for lead capture', es: 'Considera agregar chat/bot a la página de inicio para captura de leads', ru: 'Рассмотрите добавление чата/бота на главную для захвата лидов' },
      ].map((a) => gl(a, lang));

  if (isResult) {
    return (
      <ToolResult
        lang={lang}
        toolId="website-audit"
        t={t}
        answers={answers}
        quickWins={wins}
        nextActions={nextActions}
        onReset={clearSession}
        scoreBlock={
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: level.color }}>{t.yourScore}</p>
            <div className="flex items-end gap-4 mb-1">
              <span className="font-['Inter_Tight',system-ui,sans-serif] font-bold text-5xl text-[#F4F1EA]">{score}</span>
              <span className="font-semibold mb-2" style={{ color: level.color }}>{gl(level.label, lang)}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mt-3" style={{ background: 'linear-gradient(90deg,#0c1018,#1a2030)', boxShadow: '0 1px 3px rgba(0,0,0,0.5) inset' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: level.color, boxShadow: `0 0 8px ${level.color}66` }} />
            </div>
          </div>
        }
      />
    );
  }

  const progress = Math.round((step / QUESTIONS.length) * 100);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-[#A7AFBA]"><span>{step + 1} / {QUESTIONS.length}</span><span>{progress}%</span></div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg,#0c1018,#141a24)', boxShadow: '0 1px 3px rgba(0,0,0,0.5) inset' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#4dcfed,#6ee7f9)', boxShadow: '0 0 6px rgba(110,231,249,0.35)' }} />
        </div>
      </div>
      <div style={{ background: 'linear-gradient(160deg,rgba(255,255,255,0.055) 0%,#151A23 30%,#111620 100%)', border: '1px solid rgba(255,255,255,0.1)', borderBottomColor: 'rgba(0,0,0,0.4)', boxShadow: 'var(--v-shadow-md)', borderRadius: '1rem', padding: '1.5rem 2rem' }}>
        <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-6">{gl(cq.q, lang)}</h2>
        <div className="space-y-2">
          {cq.opts.map((o) => (
            <button key={o.v} onClick={() => setSession((s) => ({ ...s, selected: o.v }))}
              className="w-full text-start px-4 py-3.5 rounded-xl text-sm transition-all duration-150"
              style={selected === o.v
                ? { background: 'linear-gradient(160deg,rgba(110,231,249,0.1) 0%,rgba(110,231,249,0.04) 100%)', border: '1px solid rgba(110,231,249,0.45)', color: '#F4F1EA', boxShadow: 'var(--v-shadow-sm)' }
                : { background: 'linear-gradient(160deg,rgba(255,255,255,0.04) 0%,#151a23 100%)', border: '1px solid rgba(255,255,255,0.08)', borderBottomColor: 'rgba(0,0,0,0.35)', color: '#A7AFBA', boxShadow: 'var(--v-shadow-sm)' }
              }
            >
              {gl(o.l, lang)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={() => { if (step === 0) return; const pq = QUESTIONS[step-1]; setSession((s) => ({...s, step: s.step-1, selected: s.answers[pq.id]||''})); }} disabled={step === 0} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] disabled:opacity-30 transition-colors font-mono">← {t.back}</button>
        <button
          onClick={() => { if (!selected) return; setSession((s) => ({...s, answers:{...s.answers,[cq.id]:selected}, selected:'', step:s.step+1})); }}
          disabled={!selected}
          className="font-semibold text-sm px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: 'linear-gradient(180deg,#7df0ff 0%,#6ee7f9 45%,#4dcfed 100%)', color: '#0E1117', boxShadow: '0 1px 0 0 rgba(255,255,255,0.22) inset,0 -1px 0 0 rgba(0,0,0,0.2) inset,0 4px 12px rgba(110,231,249,0.25)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {step === QUESTIONS.length - 1 ? t.seeResults : t.next} →
        </button>
      </div>
    </div>
  );
}
