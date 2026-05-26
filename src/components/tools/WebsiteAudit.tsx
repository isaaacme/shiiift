import { useState, useEffect } from 'react';
import ToolResult from './ToolResult';
import { useToolSession, trackEvent } from './useToolSession';

type Lang = 'he' | 'en' | 'es' | 'ru';

interface Props {
  t: { back: string; next: string; seeResults: string; startOver: string; yourScore: string; topFindings: string; quickWins: string; nextActions: string; relatedTools: string; newsletterTitle: string; newsletterPlaceholder: string; newsletterCta: string; newsletterDisclaimer: string; lang: string };
}

function gl(obj: Record<string, string>, lang: string) { return obj[lang] ?? obj['en'] ?? ''; }

interface PsiMetric {
  id: string;
  value: number | null;
  unit: string;
  rating: 'good' | 'needs-improvement' | 'poor' | 'n/a';
  label: Record<Lang, string>;
  what: Record<Lang, string>;
  fix: Record<Lang, string>;
  goodThreshold: number;
  poorThreshold: number;
}

interface PsiData {
  performanceScore: number;
  metrics: PsiMetric[];
  mobileScore: number | null;
  url: string;
}

const METRIC_GUIDES: Omit<PsiMetric, 'value' | 'rating'>[] = [
  {
    id: 'first-contentful-paint',
    unit: 's',
    goodThreshold: 1.8,
    poorThreshold: 3.0,
    label: { he: 'First Contentful Paint', en: 'First Contentful Paint', es: 'First Contentful Paint', ru: 'First Contentful Paint' },
    what: {
      he: 'כמה מהר מוצג תוכן ראשון על המסך. משתמשים רואים שמשהו קורה.',
      en: 'How fast the first content appears on screen. Users see that something is happening.',
      es: 'Qué tan rápido aparece el primer contenido en pantalla.',
      ru: 'Как быстро появляется первый контент на экране.',
    },
    fix: {
      he: 'הקטן CSS חסום-עיבוד, השתמש בפונטים מערכת בטעינה ראשונה, הפעל דחיסת gzip/Brotli על השרת.',
      en: 'Reduce render-blocking CSS, use system fonts on first load, enable gzip/Brotli compression on the server.',
      es: 'Reduce el CSS que bloquea el renderizado, usa fuentes del sistema en la primera carga, activa compresión gzip/Brotli.',
      ru: 'Уменьшите блокирующий CSS, используйте системные шрифты при первой загрузке, включите сжатие gzip/Brotli.',
    },
  },
  {
    id: 'largest-contentful-paint',
    unit: 's',
    goodThreshold: 2.5,
    poorThreshold: 4.0,
    label: { he: 'Largest Contentful Paint', en: 'Largest Contentful Paint', es: 'Largest Contentful Paint', ru: 'Largest Contentful Paint' },
    what: {
      he: 'מתי הרכיב הגדול ביותר (תמונה/כותרת ראשית) נטען. Google משתמש בזה כמדד מהירות עיקרי.',
      en: 'When the largest element (hero image/headline) loads. Google uses this as its primary speed metric.',
      es: 'Cuándo carga el elemento más grande (imagen/titular). Google lo usa como métrica de velocidad principal.',
      ru: 'Когда загружается самый большой элемент (изображение/заголовок). Google использует это как основной показатель скорости.',
    },
    fix: {
      he: 'העבר תמונת הגיבור ל-CDN, הוסף preload לתמונה הראשית, השתמש בפורמט WebP/AVIF.',
      en: 'Host hero image on a CDN, add a <link rel="preload"> for the main image, use WebP/AVIF format.',
      es: 'Aloja la imagen principal en un CDN, añade preload para la imagen principal, usa formato WebP/AVIF.',
      ru: 'Разместите главное изображение на CDN, добавьте preload для основного изображения, используйте WebP/AVIF.',
    },
  },
  {
    id: 'total-blocking-time',
    unit: 'ms',
    goodThreshold: 200,
    poorThreshold: 600,
    label: { he: 'Total Blocking Time', en: 'Total Blocking Time', es: 'Total Blocking Time', ru: 'Total Blocking Time' },
    what: {
      he: 'כמה זמן הדפדפן "תקוע" מריץ JavaScript ולא יכול להגיב לקליקים. ישירות משפיע על תחושת "קפאון".',
      en: 'How long the browser is "stuck" running JavaScript and cannot respond to clicks. Directly causes the "frozen" feeling.',
      es: 'Cuánto tiempo el navegador está "atascado" ejecutando JavaScript y no puede responder a clics.',
      ru: 'Сколько времени браузер «застрял» выполняя JavaScript и не может реагировать на клики.',
    },
    fix: {
      he: 'פצל JavaScript לחתיכות קטנות (code splitting), הסר סקריפטים של צד שלישי שלא בשימוש, דחה סקריפטים לא הכרחיים.',
      en: 'Split JavaScript into smaller chunks (code splitting), remove unused third-party scripts, defer non-critical scripts.',
      es: 'Divide JavaScript en fragmentos más pequeños (code splitting), elimina scripts de terceros no usados, difiere scripts no críticos.',
      ru: 'Разбейте JavaScript на меньшие фрагменты (code splitting), удалите неиспользуемые сторонние скрипты, отложите некритичные скрипты.',
    },
  },
  {
    id: 'cumulative-layout-shift',
    unit: '',
    goodThreshold: 0.1,
    poorThreshold: 0.25,
    label: { he: 'Cumulative Layout Shift', en: 'Cumulative Layout Shift', es: 'Cumulative Layout Shift', ru: 'Cumulative Layout Shift' },
    what: {
      he: 'כמה האתר "קופץ" בזמן טעינה — כשכפתורים זזים לפני שלוחצים. מעצבן ומוריד המרות.',
      en: 'How much the page "jumps" while loading — when buttons move before you click them. Annoying and kills conversions.',
      es: 'Cuánto "salta" la página durante la carga — cuando los botones se mueven antes de hacer clic.',
      ru: 'Насколько страница «прыгает» во время загрузки — когда кнопки смещаются перед нажатием.',
    },
    fix: {
      he: 'הגדר מידות width/height לכל תמונה, הוסף גובה שמור לפרסומות/embeds, טען פונטים עם font-display: swap.',
      en: 'Set explicit width/height on all images, add reserved height for ads/embeds, load fonts with font-display: swap.',
      es: 'Establece ancho/alto explícito en todas las imágenes, añade altura reservada para anuncios/embeds, carga fuentes con font-display: swap.',
      ru: 'Укажите явные ширину/высоту для всех изображений, зарезервируйте высоту для рекламы/embeds, загружайте шрифты с font-display: swap.',
    },
  },
  {
    id: 'speed-index',
    unit: 's',
    goodThreshold: 3.4,
    poorThreshold: 5.8,
    label: { he: 'Speed Index', en: 'Speed Index', es: 'Speed Index', ru: 'Speed Index' },
    what: {
      he: 'מהירות ממוצעת שבה תוכן נראה על המסך. ציון נמוך = חווית טעינה חלקה יותר.',
      en: 'Average speed at which content becomes visible. Lower = smoother loading experience.',
      es: 'Velocidad promedio a la que el contenido se vuelve visible. Menor = experiencia de carga más fluida.',
      ru: 'Средняя скорость появления контента. Ниже = более плавный опыт загрузки.',
    },
    fix: {
      he: 'הפעל lazy loading לתמונות מחוץ למסך, הגדר תעדוף לטעינת תוכן מעל הקפל, הסר JavaScript חוסם.',
      en: 'Enable lazy loading for off-screen images, prioritise above-the-fold content loading, remove render-blocking JavaScript.',
      es: 'Activa lazy loading para imágenes fuera de pantalla, prioriza el contenido above-the-fold, elimina JavaScript que bloquea el renderizado.',
      ru: 'Включите отложенную загрузку для изображений за пределами экрана, приоритизируйте контент выше линии сгиба, удалите блокирующий JavaScript.',
    },
  },
];

function getRating(value: number, good: number, poor: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

const RATING_COLOR = { good: '#C7FF4A', 'needs-improvement': '#FFD060', poor: '#FF7A59', 'n/a': '#A7AFBA' };
const RATING_LABEL: Record<string, Record<Lang, string>> = {
  good: { he: 'טוב', en: 'Good', es: 'Bueno', ru: 'Хорошо' },
  'needs-improvement': { he: 'לשפר', en: 'Needs work', es: 'Mejorable', ru: 'Нужно улучшить' },
  poor: { he: 'גרוע', en: 'Poor', es: 'Malo', ru: 'Плохо' },
  'n/a': { he: 'לא זמין', en: 'N/A', es: 'N/D', ru: 'Н/Д' },
};

async function fetchPsi(url: string): Promise<PsiData> {
  const base = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  const encoded = encodeURIComponent(url);
  const keyParam = typeof import.meta.env !== 'undefined' && import.meta.env.GOOGLE_API_PAGESPEED
    ? `&key=${encodeURIComponent(import.meta.env.GOOGLE_API_PAGESPEED)}`
    : '';

  const desktopRes = await fetch(`${base}?url=${encoded}&strategy=desktop${keyParam}`);
  if (desktopRes.status === 429) throw new Error('RATE_LIMITED');
  if (!desktopRes.ok) throw new Error(`PSI API error: ${desktopRes.status}`);

  const desktop = await desktopRes.json();
  if (desktop?.error) throw new Error(desktop.error?.message ?? 'PSI error');
  if (!desktop?.lighthouseResult) throw new Error('No Lighthouse result returned');

  const mobileRes = await fetch(`${base}?url=${encoded}&strategy=mobile${keyParam}`);
  const mobile = mobileRes.ok ? await mobileRes.json() : null;

  const audits = desktop.lighthouseResult.audits ?? {};
  const cats = desktop.lighthouseResult.categories ?? {};
  const perfScore = Math.round((cats?.performance?.score ?? 0) * 100);
  const mobileScore = mobile?.lighthouseResult?.categories?.performance?.score != null
    ? Math.round(mobile.lighthouseResult.categories.performance.score * 100)
    : null;

  const metrics: PsiMetric[] = METRIC_GUIDES.map((g) => {
    const audit = audits[g.id];
    const raw = audit?.numericValue ?? null;
    const displayValue = raw !== null ? (g.unit === 'ms' ? raw : raw / 1000) : null;
    return {
      ...g,
      value: displayValue !== null ? Math.round(displayValue * 10) / 10 : null,
      rating: displayValue !== null ? getRating(displayValue, g.goodThreshold, g.poorThreshold) : 'n/a',
    };
  });

  return { performanceScore: perfScore, metrics, mobileScore, url };
}

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

const cardStyle = { background: 'linear-gradient(160deg,rgba(255,255,255,0.055) 0%,#151A23 30%,#111620 100%)', border: '1px solid rgba(255,255,255,0.1)', borderBottomColor: 'rgba(0,0,0,0.4)', boxShadow: 'var(--v-shadow-md)', borderRadius: '1rem', padding: '1.5rem 2rem' };

function MetricCard({ metric, lang, expanded, onToggle }: { metric: PsiMetric; lang: Lang; expanded: boolean; onToggle: () => void }) {
  const color = RATING_COLOR[metric.rating];
  const displayVal = metric.value !== null
    ? `${metric.value}${metric.unit}`
    : gl(RATING_LABEL['n/a'], lang);
  return (
    <div style={{ background: 'linear-gradient(160deg,rgba(255,255,255,0.03) 0%,#151A23 100%)', border: `1px solid ${metric.rating !== 'n/a' ? color + '33' : 'rgba(255,255,255,0.08)'}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
      <button className="w-full text-start px-4 py-3.5 flex items-center justify-between gap-3" onClick={onToggle}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm font-mono text-[#F4F1EA] truncate">{metric.label[lang]}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-mono text-sm font-bold" style={{ color }}>{displayVal}</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: color + '22', color }}>{gl(RATING_LABEL[metric.rating], lang)}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#A7AFBA', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-3">
          <div>
            <p className="font-mono text-xs text-[#A7AFBA] uppercase tracking-wider mb-1">{lang === 'he' ? 'מה זה?' : lang === 'ru' ? 'Что это?' : lang === 'es' ? '¿Qué es?' : 'What is this?'}</p>
            <p className="text-sm text-[#A7AFBA] leading-relaxed">{metric.what[lang]}</p>
          </div>
          {metric.rating !== 'good' && (
            <div>
              <p className="font-mono text-xs uppercase tracking-wider mb-1" style={{ color: '#C7FF4A' }}>{lang === 'he' ? 'איך לתקן' : lang === 'ru' ? 'Как исправить' : lang === 'es' ? 'Cómo arreglarlo' : 'How to fix'}</p>
              <p className="text-sm text-[#F4F1EA] leading-relaxed">{metric.fix[lang]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PsiPanel({ psi, lang }: { psi: PsiData; lang: Lang }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const scoreColor = psi.performanceScore >= 90 ? '#C7FF4A' : psi.performanceScore >= 50 ? '#FFD060' : '#FF7A59';
  const allNA = psi.metrics.every((m) => m.rating === 'n/a');
  return (
    <div className="space-y-4">
      <div style={cardStyle}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-xs text-[#A7AFBA] uppercase tracking-wider mb-1">{lang === 'he' ? 'ציון ביצועים — שולחן עבודה' : lang === 'ru' ? 'Оценка производительности — десктоп' : lang === 'es' ? 'Puntuación de rendimiento — escritorio' : 'Performance Score — Desktop'}</p>
            <div className="flex items-end gap-3">
              <span className="font-bold text-4xl" style={{ color: scoreColor, fontFamily: "'Inter Tight', system-ui, sans-serif" }}>{psi.performanceScore}</span>
              <span className="text-sm text-[#A7AFBA] mb-1">/100</span>
              {psi.mobileScore !== null && (
                <span className="text-xs text-[#A7AFBA] mb-1 ms-2">{lang === 'he' ? 'נייד:' : lang === 'ru' ? 'Моб:' : lang === 'es' ? 'Móvil:' : 'Mobile:'} <span style={{ color: psi.mobileScore >= 90 ? '#C7FF4A' : psi.mobileScore >= 50 ? '#FFD060' : '#FF7A59' }}>{psi.mobileScore}</span></span>
              )}
            </div>
          </div>
          <a href={`https://pagespeed.web.dev/report?url=${encodeURIComponent(psi.url)}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-[#6EE7F9] hover:underline">{lang === 'he' ? 'דוח מלא ↗' : lang === 'ru' ? 'Полный отчёт ↗' : lang === 'es' ? 'Informe completo ↗' : 'Full report ↗'}</a>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#0c1018' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${psi.performanceScore}%`, backgroundColor: scoreColor, boxShadow: `0 0 8px ${scoreColor}66` }} />
        </div>
      </div>
      {allNA ? (
        <div className="px-4 py-3 rounded-xl text-sm font-mono" style={{ background: 'rgba(255,122,89,0.08)', border: '1px solid rgba(255,122,89,0.25)', color: '#FF7A59' }}>
          {lang === 'he'
            ? 'Google PageSpeed לא הצליח לאחזר מדדים לכתובת זו. ודא שהאתר נגיש לציבור ולא חסום מאינדוקס.'
            : lang === 'ru'
            ? 'Google PageSpeed не смог получить метрики для этого URL. Убедитесь, что сайт публично доступен.'
            : lang === 'es'
            ? 'Google PageSpeed no pudo obtener métricas para esta URL. Asegúrate de que el sitio sea públicamente accesible.'
            : 'Google PageSpeed could not fetch metrics for this URL. Make sure the site is publicly accessible and not blocked from crawling.'}
          {' '}<a href={`https://pagespeed.web.dev/report?url=${encodeURIComponent(psi.url)}`} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#6EE7F9' }}>
            {lang === 'he' ? 'נסה ישירות ב-PageSpeed ↗' : lang === 'ru' ? 'Попробуйте напрямую ↗' : lang === 'es' ? 'Inténtalo directamente ↗' : 'Try directly on PageSpeed ↗'}
          </a>
        </div>
      ) : (
        <>
          <p className="font-mono text-xs text-[#A7AFBA] uppercase tracking-wider px-1">{lang === 'he' ? 'מדדי Core Web Vitals — לחץ לפרטים ופתרונות' : lang === 'ru' ? 'Core Web Vitals — нажмите для деталей и решений' : lang === 'es' ? 'Core Web Vitals — haz clic para detalles y soluciones' : 'Core Web Vitals — click each for details & fixes'}</p>
          <div className="space-y-2">
            {psi.metrics.map((m) => (
              <MetricCard key={m.id} metric={m} lang={lang} expanded={expanded === m.id} onToggle={() => setExpanded(expanded === m.id ? null : m.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type Phase = 'url' | 'loading' | 'psi' | 'questions' | 'result';

export default function WebsiteAudit({ t }: Props) {
  const lang = (t.lang || 'en') as Lang;
  const [session, setSession, clearSession] = useToolSession('website-audit', { step: 0, answers: {} as Record<string, string>, selected: '' });
  const { step, answers, selected } = session;

  const [phase, setPhase] = useState<Phase>('url');
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [psiData, setPsiData] = useState<PsiData | null>(null);
  const [psiError, setPsiError] = useState('');

  const isResult = phase === 'result' || (phase === 'questions' && step >= QUESTIONS.length);
  const cq = QUESTIONS[step];
  const score = Math.round(Object.entries(answers).reduce((acc, [k, v]) => {
    const q = QUESTIONS.find((q) => q.id === k);
    const opt = q?.opts.find((o) => o.v === v);
    return acc + (opt?.s ?? 0);
  }, 0) / 60 * 100);

  const psiBonus = psiData ? Math.round(psiData.performanceScore / 5) : 0;
  const finalScore = Math.min(100, Math.round(score * 0.7 + psiBonus));
  const level = LEVEL_LABELS.find((l) => finalScore >= l.min && finalScore <= l.max) ?? LEVEL_LABELS[0];

  useEffect(() => {
    if (phase === 'url') trackEvent('tool_started', { tool: 'website-audit', lang });
  }, []);

  useEffect(() => {
    if (isResult) trackEvent('tool_completed', { tool: 'website-audit', lang, score: String(finalScore) });
  }, [isResult]);

  const handleUrlSubmit = async () => {
    let url = urlInput.trim();
    if (!url) { setUrlError(lang === 'he' ? 'נא להזין כתובת אתר' : lang === 'ru' ? 'Пожалуйста, введите URL' : lang === 'es' ? 'Por favor ingresa una URL' : 'Please enter a URL'); return; }
    if (!url.startsWith('http')) url = 'https://' + url;
    let parsed: URL;
    try { parsed = new URL(url); } catch { setUrlError(lang === 'he' ? 'כתובת לא תקינה' : lang === 'ru' ? 'Недействительный URL' : lang === 'es' ? 'URL no válida' : 'Invalid URL'); return; }
    const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname.endsWith('.local') || /^192\.168\./.test(parsed.hostname);
    if (isLocal) {
      setUrlError(lang === 'he' ? 'Google PageSpeed לא יכול לנתח כתובות מקומיות. הזן את כתובת האתר הציבורי שלך.' : lang === 'ru' ? 'Google PageSpeed не может анализировать локальные адреса. Введите публичный URL.' : lang === 'es' ? 'Google PageSpeed no puede analizar URLs locales. Ingresa tu URL pública.' : 'Google PageSpeed cannot analyse localhost. Enter your live public website URL.');
      return;
    }
    setUrlError('');
    setPhase('loading');
    try {
      const data = await fetchPsi(url);
      setPsiData(data);
      setPhase('psi');
    } catch (err: any) {
      const isRateLimit = err?.message === 'RATE_LIMITED';
      setPsiError(isRateLimit
        ? (lang === 'he' ? 'Google PageSpeed הגיע למגבלת בקשות. המתן מספר דקות ונסה שוב, או בדוק ישירות בpagespeed.web.dev' : lang === 'ru' ? 'Google PageSpeed достиг лимита запросов. Подождите несколько минут или проверьте напрямую на pagespeed.web.dev' : lang === 'es' ? 'Google PageSpeed alcanzó el límite de solicitudes. Espera unos minutos o comprueba en pagespeed.web.dev' : 'Google PageSpeed rate limit reached. Wait a few minutes and try again, or check directly at pagespeed.web.dev')
        : (lang === 'he' ? 'לא ניתן לנתח את האתר. בדוק שהכתובת נגישה לציבור ונסה שוב.' : lang === 'ru' ? 'Не удалось проанализировать сайт. Проверьте, что URL публично доступен.' : lang === 'es' ? 'No se pudo analizar el sitio. Verifica que la URL sea públicamente accesible.' : 'Could not analyse the site. Make sure the URL is publicly accessible and try again.')
      );
      setPhase('url');
    }
  };

  const wins = [
    answers.cta !== 'tested' && { he: 'ערוך A/B טסט על ה-CTA הראשי', en: 'Run an A/B test on your primary CTA', es: 'Haz un A/B test en tu CTA principal', ru: 'Проведите A/B тест основного CTA' },
    psiData && psiData.performanceScore < 50 && { he: 'ציון ביצועים קריטי — תקן LCP ו-TBT לפני הכל', en: 'Critical performance score — fix LCP and TBT first', es: 'Puntuación crítica — arregla LCP y TBT primero', ru: 'Критическая оценка производительности — сначала исправьте LCP и TBT' },
    answers.leads !== 'crm' && { he: 'חבר טופס ל-CRM ואוטומט מעקב', en: 'Connect form to CRM and automate follow-up', es: 'Conecta formulario al CRM y automatiza el seguimiento', ru: 'Подключите форму к CRM и автоматизируйте follow-up' },
    answers.analytics === 'no' && { he: 'התקן Google Analytics 4 עם מעקב אחר אירועים', en: 'Install GA4 with event tracking', es: 'Instala GA4 con seguimiento de eventos', ru: 'Установите GA4 с отслеживанием событий' },
    psiData && psiData.metrics.find(m => m.id === 'cumulative-layout-shift' && m.rating === 'poor') && { he: 'תקן CLS — האתר קופץ בטעינה ומרחיק משתמשים', en: 'Fix CLS — your page jumps while loading and loses users', es: 'Arregla CLS — tu página salta durante la carga', ru: 'Исправьте CLS — страница прыгает при загрузке' },
  ].filter(Boolean).slice(0, 3).map((w: any) => gl(w, lang));

  const nextActions = finalScore < 40
    ? [
        { he: 'הוסף CTA ראשי ברור לדף הבית', en: 'Add a single clear primary CTA to your homepage', es: 'Agrega un CTA principal claro a tu página de inicio', ru: 'Добавьте чёткий основной CTA на главную страницу' },
        { he: 'חבר טופס יצירת קשר ל-CRM עם מעקב אוטומטי', en: 'Connect contact form to CRM with auto follow-up', es: 'Conecta formulario al CRM con seguimiento automático', ru: 'Подключите форму к CRM с авто-follow-up' },
      ].map((a) => gl(a, lang))
    : [
        { he: 'הגדר מעקב המרות ב-GA4 ובנה דוח שבועי', en: 'Set up GA4 conversion tracking and build a weekly report', es: 'Configura seguimiento de conversiones en GA4 y crea informe semanal', ru: 'Настройте отслеживание конверсий в GA4 и еженедельный отчёт' },
        { he: 'בחן הוספת צ\'אט/בוט לדף הבית לייצור לידים', en: 'Consider adding a chat/bot to homepage for lead capture', es: 'Considera agregar chat/bot a la página de inicio para captura de leads', ru: 'Рассмотрите добавление чата/бота на главную для захвата лидов' },
      ].map((a) => gl(a, lang));

  const psiFindings: string[] = psiData
    ? psiData.metrics
        .filter((m) => m.rating === 'poor' || m.rating === 'needs-improvement')
        .map((m) => `${m.label[lang]}: ${m.value !== null ? m.value + m.unit : '?'} — ${m.fix[lang]}`)
    : [];

  if (isResult || (phase === 'questions' && step >= QUESTIONS.length)) {
    return (
      <ToolResult
        lang={lang}
        toolId="website-audit"
        t={t}
        answers={answers}
        findings={psiFindings}
        quickWins={wins}
        nextActions={nextActions}
        onReset={() => { clearSession(); setPhase('url'); setUrlInput(''); setPsiData(null); setPsiError(''); }}
        scoreBlock={
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-3" style={{ color: level.color }}>{t.yourScore}</p>
            <div className="flex items-end gap-4 mb-1">
              <span className="font-bold text-5xl text-[#F4F1EA]" style={{ fontFamily: "'Inter Tight', system-ui, sans-serif" }}>{finalScore}</span>
              <span className="font-semibold mb-2" style={{ color: level.color }}>{gl(level.label, lang)}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mt-3" style={{ background: '#0c1018' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${finalScore}%`, backgroundColor: level.color, boxShadow: `0 0 8px ${level.color}66` }} />
            </div>
            {psiData && (
              <p className="mt-3 text-xs font-mono text-[#A7AFBA]">
                {lang === 'he' ? `ציון PageSpeed: ${psiData.performanceScore}/100 (שולחן) · ${psiData.mobileScore}/100 (נייד)` : lang === 'ru' ? `PageSpeed: ${psiData.performanceScore}/100 (десктоп) · ${psiData.mobileScore}/100 (моб)` : lang === 'es' ? `PageSpeed: ${psiData.performanceScore}/100 (escritorio) · ${psiData.mobileScore}/100 (móvil)` : `PageSpeed: ${psiData.performanceScore}/100 (desktop) · ${psiData.mobileScore}/100 (mobile)`}
              </p>
            )}
          </div>
        }
      />
    );
  }

  if (phase === 'url') {
    return (
      <div className="space-y-6">
        <div style={cardStyle}>
          <h2 className="font-semibold text-xl text-[#F4F1EA] mb-2" style={{ fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
            {lang === 'he' ? 'מה כתובת האתר שלך?' : lang === 'ru' ? 'Какой у вас URL сайта?' : lang === 'es' ? '¿Cuál es la URL de tu sitio?' : "What's your website URL?"}
          </h2>
          <p className="text-sm text-[#A7AFBA] mb-5">
            {lang === 'he' ? 'נבצע בדיקת ביצועים אמיתית עם Google PageSpeed Insights.' : lang === 'ru' ? 'Мы проведём реальную проверку производительности с Google PageSpeed Insights.' : lang === 'es' ? 'Realizaremos un análisis de rendimiento real con Google PageSpeed Insights.' : "We'll run a real performance check using Google PageSpeed Insights."}
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="https://yoursite.com"
              className="flex-1 px-4 py-3 rounded-xl text-sm text-[#F4F1EA] font-mono outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: urlError ? '1px solid #FF7A59' : '1px solid rgba(255,255,255,0.1)', caretColor: '#6EE7F9' }}
              dir="ltr"
            />
            <button
              onClick={handleUrlSubmit}
              className="px-5 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ background: 'linear-gradient(180deg,#7df0ff 0%,#6ee7f9 45%,#4dcfed 100%)', color: '#0E1117', boxShadow: '0 4px 12px rgba(110,231,249,0.25)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {lang === 'he' ? 'נתח' : lang === 'ru' ? 'Анализ' : lang === 'es' ? 'Analizar' : 'Analyse'}
            </button>
          </div>
          {urlError && <p className="mt-2 text-xs text-[#FF7A59] font-mono">{urlError}</p>}
          {psiError && <p className="mt-2 text-xs text-[#FF7A59] font-mono">{psiError}</p>}
        </div>
        <button
          onClick={() => setPhase('questions')}
          className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] transition-colors font-mono underline underline-offset-4"
        >
          {lang === 'he' ? 'דלג על בדיקת ביצועים ←' : lang === 'ru' ? 'Пропустить проверку скорости →' : lang === 'es' ? 'Saltar análisis de velocidad →' : 'Skip speed check →'}
        </button>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div style={cardStyle} className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#6EE7F9] border-t-transparent animate-spin" />
        <p className="font-mono text-sm text-[#A7AFBA]">
          {lang === 'he' ? 'מנתח את האתר שלך...' : lang === 'ru' ? 'Анализируем ваш сайт...' : lang === 'es' ? 'Analizando tu sitio...' : 'Analysing your site...'}
        </p>
        <p className="font-mono text-xs text-[#A7AFBA]/60">
          {lang === 'he' ? 'בדיקת שולחן עבודה + נייד — עשוי לקחת ~15 שניות' : lang === 'ru' ? 'Проверка десктоп + мобайл — может занять ~15 сек' : lang === 'es' ? 'Comprobando escritorio + móvil — puede tardar ~15 seg' : 'Checking desktop + mobile — may take ~15 seconds'}
        </p>
      </div>
    );
  }

  if (phase === 'psi' && psiData) {
    return (
      <div className="space-y-6">
        <PsiPanel psi={psiData} lang={lang} />
        <div className="flex justify-end">
          <button
            onClick={() => setPhase('questions')}
            className="font-semibold text-sm px-6 py-2.5 rounded-xl transition-all"
            style={{ background: 'linear-gradient(180deg,#7df0ff 0%,#6ee7f9 45%,#4dcfed 100%)', color: '#0E1117', boxShadow: '0 4px 12px rgba(110,231,249,0.25)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {lang === 'he' ? 'המשך לשאלון ←' : lang === 'ru' ? 'Продолжить опрос →' : lang === 'es' ? 'Continuar al cuestionario →' : 'Continue to questionnaire →'}
          </button>
        </div>
      </div>
    );
  }

  const progress = Math.round(((step + 1) / QUESTIONS.length) * 100);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-[#A7AFBA]"><span>{step + 1} / {QUESTIONS.length}</span><span>{progress}%</span></div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg,#0c1018,#141a24)', boxShadow: '0 1px 3px rgba(0,0,0,0.5) inset' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#4dcfed,#6ee7f9)', boxShadow: '0 0 6px rgba(110,231,249,0.35)' }} />
        </div>
      </div>
      <div style={cardStyle}>
        <h2 className="font-semibold text-xl text-[#F4F1EA] mb-6" style={{ fontFamily: "'Inter Tight', system-ui, sans-serif" }}>{gl(cq.q, lang)}</h2>
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
        <button
          onClick={() => {
            if (step === 0) { setPhase(psiData ? 'psi' : 'url'); return; }
            const pq = QUESTIONS[step - 1];
            setSession((s) => ({ ...s, step: s.step - 1, selected: s.answers[pq.id] || '' }));
          }}
          className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] transition-colors font-mono"
        >
          {lang === 'he' ? '→' : '←'} {t.back}
        </button>
        <button
          onClick={() => { if (!selected) return; setSession((s) => ({ ...s, answers: { ...s.answers, [cq.id]: selected }, selected: '', step: s.step + 1 })); }}
          disabled={!selected}
          className="font-semibold text-sm px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: 'linear-gradient(180deg,#7df0ff 0%,#6ee7f9 45%,#4dcfed 100%)', color: '#0E1117', boxShadow: '0 1px 0 0 rgba(255,255,255,0.22) inset,0 -1px 0 0 rgba(0,0,0,0.2) inset,0 4px 12px rgba(110,231,249,0.25)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {step === QUESTIONS.length - 1 ? t.seeResults : t.next} {lang === 'he' ? '←' : '→'}
        </button>
      </div>
    </div>
  );
}
