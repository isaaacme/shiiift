import { useState, useEffect } from 'react';
import ToolResult from './ToolResult';
import { useToolSession, trackEvent } from './useToolSession';

const HOURS_COST_MAP: Record<string, number> = { many: 17, some: 10, few: 3, automated: 0 };

async function fetchLocalRate(lang: string): Promise<{ symbol: string; rate: number; code: string }> {
  const currencyMap: Record<string, { code: string; symbol: string }> = {
    he: { code: 'ILS', symbol: '₪' },
    ru: { code: 'RUB', symbol: '₽' },
    es: { code: 'EUR', symbol: '€' },
    en: { code: 'USD', symbol: '$' },
  };
  const { code, symbol } = currencyMap[lang] ?? currencyMap.en;
  if (code === 'USD') return { symbol, rate: 1, code };
  try {
    const res = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    if (!res.ok) return { symbol, rate: 1, code };
    const data = await res.json();
    return { symbol, rate: data.rates?.[code] ?? 1, code };
  } catch {
    return { symbol, rate: 1, code };
  }
}

interface Translations {
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
}

interface Props {
  t: Translations;
}

const QUESTIONS = [
  {
    id: 'businessType',
    question: { he: 'מה סוג העסק שלך?', en: 'What type of business do you run?', es: '¿Qué tipo de negocio tienes?', ru: 'Какой у вас тип бизнеса?' },
    type: 'select',
    options: [
      { value: 'agency', label: { he: 'סוכנות / פרילנסר', en: 'Agency / Freelancer', es: 'Agencia / Freelancer', ru: 'Агентство / Фриланс' } },
      { value: 'service', label: { he: 'עסק שירותים', en: 'Service business', es: 'Empresa de servicios', ru: 'Сервисный бизнес' } },
      { value: 'clinic', label: { he: 'קליניקה / רפואה', en: 'Clinic / Healthcare', es: 'Clínica / Salud', ru: 'Клиника / Медицина' } },
      { value: 'retail', label: { he: 'קמעונאות / מסחר', en: 'Retail / Commerce', es: 'Retail / Comercio', ru: 'Ритейл / Торговля' } },
      { value: 'logistics', label: { he: 'לוגיסטיקה / תפעול', en: 'Logistics / Operations', es: 'Logística / Operaciones', ru: 'Логистика / Операции' } },
      { value: 'other', label: { he: 'אחר', en: 'Other', es: 'Otro', ru: 'Другое' } },
    ],
    weight: 0,
  },
  {
    id: 'teamSize',
    question: { he: 'כמה אנשים בצוות שלך?', en: 'How many people are on your team?', es: '¿Cuántas personas hay en tu equipo?', ru: 'Сколько человек в вашей команде?' },
    type: 'select',
    options: [
      { value: '1', label: { he: 'רק אני', en: 'Just me', es: 'Solo yo', ru: 'Только я' } },
      { value: '2-5', label: { he: '2–5', en: '2–5', es: '2–5', ru: '2–5' } },
      { value: '6-20', label: { he: '6–20', en: '6–20', es: '6–20', ru: '6–20' } },
      { value: '20+', label: { he: 'יותר מ-20', en: 'More than 20', es: 'Más de 20', ru: 'Более 20' } },
    ],
    weight: 0,
  },
  {
    id: 'websiteRole',
    question: { he: 'האתר שלך ממיר לידים?', en: 'Does your website generate leads?', es: '¿Tu sitio web genera leads?', ru: 'Ваш сайт генерирует лиды?' },
    type: 'select',
    options: [
      { value: 'no', label: { he: 'לא, הוא פשוט קיים', en: 'No, it just exists', es: 'No, solo existe', ru: 'Нет, он просто существует' }, score: 0 },
      { value: 'sometimes', label: { he: 'לפעמים, אבל לא בעקביות', en: 'Sometimes, but not consistently', es: 'A veces, pero no consistentemente', ru: 'Иногда, но не постоянно' }, score: 5 },
      { value: 'yes', label: { he: 'כן, אנחנו מקבלים לידים קבועים', en: 'Yes, we get regular leads', es: 'Sí, recibimos leads regularmente', ru: 'Да, мы получаем регулярные лиды' }, score: 15 },
      { value: 'system', label: { he: 'הוא מחובר ל-CRM וממיר אוטומטית', en: 'It\'s connected to CRM and converts automatically', es: 'Está conectado al CRM y convierte automáticamente', ru: 'Он подключён к CRM и конвертирует автоматически' }, score: 25 },
    ],
    weight: 25,
  },
  {
    id: 'leadProcess',
    question: { he: 'איך אתה מנהל לידים כיום?', en: 'How do you currently manage leads?', es: '¿Cómo gestionas los leads actualmente?', ru: 'Как вы сейчас управляете лидами?' },
    type: 'select',
    options: [
      { value: 'whatsapp', label: { he: 'WhatsApp ואימייל', en: 'WhatsApp and email', es: 'WhatsApp y email', ru: 'WhatsApp и email' }, score: 0 },
      { value: 'spreadsheet', label: { he: 'גיליון אקסל / טבלה', en: 'Spreadsheet / table', es: 'Hoja de cálculo', ru: 'Таблица / Excel' }, score: 5 },
      { value: 'crm_basic', label: { he: 'CRM בסיסי', en: 'Basic CRM', es: 'CRM básico', ru: 'Базовый CRM' }, score: 15 },
      { value: 'crm_auto', label: { he: 'CRM עם אוטומציה ומעקב', en: 'CRM with automation and tracking', es: 'CRM con automatización y seguimiento', ru: 'CRM с автоматизацией и отслеживанием' }, score: 25 },
    ],
    weight: 25,
  },
  {
    id: 'manualWork',
    question: { he: 'כמה שעות בשבוע הצוות עושה עבודה חוזרת/ידנית?', en: 'How many hours per week does your team spend on repetitive/manual work?', es: '¿Cuántas horas semanales dedica tu equipo a trabajo repetitivo/manual?', ru: 'Сколько часов в неделю ваша команда тратит на повторяющуюся/ручную работу?' },
    type: 'select',
    options: [
      { value: 'many', label: { he: 'יותר מ-15 שעות', en: 'More than 15 hours', es: 'Más de 15 horas', ru: 'Более 15 часов' }, score: 0 },
      { value: 'some', label: { he: '5–15 שעות', en: '5–15 hours', es: '5–15 horas', ru: '5–15 часов' }, score: 10 },
      { value: 'few', label: { he: 'פחות מ-5 שעות', en: 'Less than 5 hours', es: 'Menos de 5 horas', ru: 'Менее 5 часов' }, score: 20 },
      { value: 'automated', label: { he: 'רוב העבודה הידנית אוטומטית', en: 'Most manual work is automated', es: 'La mayoría del trabajo manual está automatizado', ru: 'Большинство ручной работы автоматизировано' }, score: 25 },
    ],
    weight: 25,
  },
  {
    id: 'analytics',
    question: { he: 'האם יש לך נתונים על ביצועי העסק?', en: 'Do you have data on your business performance?', es: '¿Tienes datos sobre el rendimiento de tu negocio?', ru: 'Есть ли у вас данные о производительности бизнеса?' },
    type: 'select',
    options: [
      { value: 'none', label: { he: 'אין מדדים ברורים', en: 'No clear metrics', es: 'Sin métricas claras', ru: 'Нет чётких метрик' }, score: 0 },
      { value: 'basic', label: { he: 'מעט נתונים, לא מסודרים', en: 'Some data, not organized', es: 'Algunos datos, no organizados', ru: 'Есть данные, но неорганизованные' }, score: 8 },
      { value: 'good', label: { he: 'יש לוח מחוונים בסיסי', en: 'We have a basic dashboard', es: 'Tenemos un dashboard básico', ru: 'У нас есть базовый дашборд' }, score: 17 },
      { value: 'excellent', label: { he: 'מדדים ברורים, נתונים בזמן אמת', en: 'Clear KPIs, real-time data', es: 'KPIs claros, datos en tiempo real', ru: 'Чёткие KPI, данные в реальном времени' }, score: 25 },
    ],
    weight: 25,
  },
];

type Lang = 'he' | 'en' | 'es' | 'ru';

function getLabel(obj: Record<string, string>, lang: string): string {
  return obj[lang] ?? obj['en'] ?? '';
}

function getScore(answers: Record<string, string>): number {
  let total = 0;
  for (const q of QUESTIONS) {
    if (!q.weight || !answers[q.id]) continue;
    const opt = (q.options as any[]).find((o) => o.value === answers[q.id]);
    if (opt?.score !== undefined) total += opt.score;
  }
  return Math.round((total / 100) * 100);
}

function getMaturityLevel(score: number, lang: string): string {
  const levels: Record<string, Record<string, string>> = {
    early: { he: 'שלב מוקדם', en: 'Early Stage', es: 'Etapa Inicial', ru: 'Ранняя стадия' },
    developing: { he: 'בפיתוח', en: 'Developing', es: 'En Desarrollo', ru: 'Развивающийся' },
    established: { he: 'מבוסס', en: 'Established', es: 'Establecido', ru: 'Устоявшийся' },
    advanced: { he: 'מתקדם', en: 'Advanced', es: 'Avanzado', ru: 'Продвинутый' },
  };
  if (score < 25) return getLabel(levels.early, lang);
  if (score < 50) return getLabel(levels.developing, lang);
  if (score < 75) return getLabel(levels.established, lang);
  return getLabel(levels.advanced, lang);
}

function getFindings(answers: Record<string, string>, lang: string): string[] {
  const findings: string[] = [];
  const msgs: Record<string, Record<string, Record<string, string>>> = {
    websiteRole: {
      no: { he: 'האתר שלך לא עובד בשבילך — הוא לא ממיר', en: 'Your website is not working for you — it\'s not converting', es: 'Tu sitio web no trabaja para ti — no convierte', ru: 'Ваш сайт не работает на вас — он не конвертирует' },
      sometimes: { he: 'המרת האתר לא עקבית — יש פוטנציאל לא מנוצל', en: 'Website conversion is inconsistent — untapped potential', es: 'La conversión del sitio es inconsistente — potencial sin aprovechar', ru: 'Конверсия сайта непостоянна — неиспользованный потенциал' },
    },
    leadProcess: {
      whatsapp: { he: 'ניהול לידים ב-WhatsApp ואימייל גורם לאיבוד לידים', en: 'Managing leads via WhatsApp/email causes lost leads', es: 'Gestionar leads por WhatsApp/email causa pérdida de leads', ru: 'Управление лидами через WhatsApp/email приводит к их потере' },
      spreadsheet: { he: 'טבלת אקסל היא צוואר בקבוק — מגביל סקייל', en: 'Spreadsheet management is a bottleneck — limits scale', es: 'La gestión en hojas de cálculo es un cuello de botella', ru: 'Управление через таблицы — узкое место, ограничивающее масштаб' },
    },
    manualWork: {
      many: { he: 'יותר מ-15 שעות עבודה ידנית בשבוע — זה בדחיפות ניתן לאוטומציה', en: 'Over 15 hours of manual work/week — urgently automatable', es: 'Más de 15 horas de trabajo manual/semana — urgentemente automatizable', ru: 'Более 15 часов ручной работы в неделю — срочно нужна автоматизация' },
      some: { he: '5–15 שעות ידניות בשבוע — כדאי לבחון אוטומציה', en: '5–15 manual hours/week — worth exploring automation', es: '5–15 horas manuales/semana — vale la pena explorar la automatización', ru: '5–15 ручных часов в неделю — стоит рассмотреть автоматизацию' },
    },
    analytics: {
      none: { he: 'אין מדדי ביצוע — מקבלים החלטות בלי נתונים', en: 'No performance metrics — making decisions blind', es: 'Sin métricas de rendimiento — tomando decisiones a ciegas', ru: 'Нет метрик производительности — принятие решений вслепую' },
      basic: { he: 'נתונים קיימים אבל לא מאורגנים — לוח מחוונים יחסוך זמן', en: 'Data exists but unorganized — a dashboard would save time', es: 'Los datos existen pero desorganizados — un dashboard ahorraría tiempo', ru: 'Данные есть, но неорганизованы — дашборд сэкономил бы время' },
    },
  };

  for (const [field, levelMsgs] of Object.entries(msgs)) {
    const val = answers[field];
    if (val && levelMsgs[val]) {
      findings.push(getLabel(levelMsgs[val], lang));
    }
  }
  return findings.slice(0, 3);
}

function getQuickWins(answers: Record<string, string>, lang: string): string[] {
  const wins: string[] = [];
  if (answers.websiteRole === 'no' || answers.websiteRole === 'sometimes') {
    const w = { he: 'הוסף טופס קליטה ברור לאתר עם הפנייה ל-CRM', en: 'Add a clear intake form to your website with CRM routing', es: 'Agrega un formulario de contacto claro con enrutamiento a CRM', ru: 'Добавьте чёткую форму заявки на сайт с маршрутизацией в CRM' };
    wins.push(getLabel(w, lang));
  }
  if (answers.leadProcess === 'whatsapp' || answers.leadProcess === 'spreadsheet') {
    const w = { he: 'הגדר CRM בסיסי (HubSpot/Pipedrive חינמי) לניהול לידים', en: 'Set up a basic CRM (free HubSpot/Pipedrive) for lead management', es: 'Configura un CRM básico (HubSpot/Pipedrive gratis) para gestión de leads', ru: 'Настройте базовый CRM (бесплатный HubSpot/Pipedrive) для управления лидами' };
    wins.push(getLabel(w, lang));
  }
  if (answers.manualWork === 'many' || answers.manualWork === 'some') {
    const w = { he: 'מפה את 3 המשימות הידניות הכי חוזרות וצור תהליך אוטומציה ראשון', en: 'Map your top 3 repetitive manual tasks and build your first automation', es: 'Mapea tus 3 tareas manuales más repetitivas y construye tu primera automatización', ru: 'Определите 3 самые повторяющиеся задачи и создайте первую автоматизацию' };
    wins.push(getLabel(w, lang));
  }
  if (answers.analytics === 'none' || answers.analytics === 'basic') {
    const w = { he: 'התקן Google Analytics 4 + Plausible ותגדיר דוח שבועי', en: 'Install Google Analytics 4 + Plausible and set up a weekly report', es: 'Instala Google Analytics 4 + Plausible y configura un reporte semanal', ru: 'Установите Google Analytics 4 + Plausible и настройте еженедельный отчёт' };
    wins.push(getLabel(w, lang));
  }
  return wins.slice(0, 3);
}

function getNextActions(answers: Record<string, string>, lang: string): string[] {
  const score = getScore(answers);
  const actions: Record<string, string>[] = [];
  if (score < 25) {
    actions.push({ he: 'הגדר מערכת CRM בסיסית (HubSpot חינמי) — שלב ראשון הכרחי', en: 'Set up a basic CRM (free HubSpot) — essential first step', es: 'Configura un CRM básico (HubSpot gratis) — primer paso esencial', ru: 'Настройте базовый CRM (бесплатный HubSpot) — обязательный первый шаг' });
    actions.push({ he: 'הוסף טופס ליצירת קשר ברור לאתר', en: 'Add a clear contact/intake form to your website', es: 'Agrega un formulario de contacto claro a tu sitio web', ru: 'Добавьте чёткую форму заявки на сайт' });
  } else if (score < 50) {
    actions.push({ he: 'חבר את הטופס שלך ל-CRM ובנה זרימת מעקב אוטומטית', en: 'Connect your form to CRM and build an automated follow-up flow', es: 'Conecta tu formulario al CRM y construye un flujo de seguimiento automatizado', ru: 'Подключите форму к CRM и создайте автоматический follow-up' });
    actions.push({ he: 'מפה 3 משימות ידניות שחוזרות ובצע אוטומציה ראשונה עם Zapier/Make', en: 'Map 3 recurring manual tasks and build your first Zapier/Make automation', es: 'Mapea 3 tareas manuales recurrentes y crea tu primera automatización', ru: 'Определите 3 повторяющиеся задачи и создайте первую автоматизацию' });
  } else if (score < 75) {
    actions.push({ he: 'שפר את לוח המחוונים שלך — הגדר KPIs ברורים ודוח שבועי', en: 'Improve your dashboard — set clear KPIs and a weekly report', es: 'Mejora tu dashboard — define KPIs claros y un informe semanal', ru: 'Улучшите дашборд — установите чёткие KPI и еженедельный отчёт' });
    actions.push({ he: 'בחן שילוב AI לתהליכי תמיכה וייצור תוכן', en: 'Explore AI integration for support and content workflows', es: 'Explora integración de IA para soporte y flujos de contenido', ru: 'Изучите интеграцию ИИ для поддержки и создания контента' });
  } else {
    actions.push({ he: 'תעד את הגדרות האוטומציה שלך ובנה נהלים לצוות', en: 'Document your automation setup and build team SOPs', es: 'Documenta tu configuración de automatización y crea SOPs', ru: 'Задокументируйте автоматизацию и создайте SOP для команды' });
    actions.push({ he: 'בחן Supabase/Airtable ליצירת לוח מחוונים מותאם אישית', en: 'Explore Supabase/Airtable for a custom business dashboard', es: 'Explora Supabase/Airtable para un dashboard empresarial personalizado', ru: 'Изучите Supabase/Airtable для настраиваемого бизнес-дашборда' });
  }
  return actions.map((a) => getLabel(a, lang));
}

export default function BusinessAudit({ t }: Props) {
  const lang = (t.lang || 'en') as Lang;
  const [session, setSession, clearSession] = useToolSession('business-audit', { step: 0, answers: {} as Record<string, string>, selected: '' });
  const { step, answers, selected } = session;

  const [currency, setCurrency] = useState<{ symbol: string; rate: number; code: string } | null>(null);

  const isResult = step >= QUESTIONS.length;
  const currentQ = QUESTIONS[step];
  const score = getScore(answers);
  const maturity = getMaturityLevel(score, lang);
  const findings = getFindings(answers, lang);
  const quickWins = getQuickWins(answers, lang);
  const nextActions = getNextActions(answers, lang);

  useEffect(() => {
    if (step === 0 && Object.keys(answers).length === 0) {
      trackEvent('tool_started', { tool: 'business-audit', lang });
    }
  }, []);

  useEffect(() => {
    if (!isResult) return;
    trackEvent('tool_completed', { tool: 'business-audit', lang, score: String(score) });
    fetchLocalRate(lang).then(setCurrency);
  }, [isResult]);

  function handleSelect(value: string) {
    setSession((s) => ({ ...s, selected: value }));
  }

  function handleNext() {
    if (!selected) return;
    setSession((s) => ({ ...s, answers: { ...s.answers, [currentQ.id]: selected }, selected: '', step: s.step + 1 }));
  }

  function handleBack() {
    if (step === 0) return;
    const prevQ = QUESTIONS[step - 1];
    setSession((s) => ({ ...s, step: s.step - 1, selected: s.answers[prevQ.id] || '' }));
  }

  function handleReset() {
    clearSession();
  }

  const progress = Math.round((step / QUESTIONS.length) * 100);

  if (isResult) {
    return (
      <ToolResult
        lang={lang}
        toolId="business-audit"
        t={t}
        answers={answers}
        findings={findings}
        quickWins={quickWins}
        nextActions={nextActions}
        onReset={handleReset}
        scoreBlock={
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-3">{t.yourScore}</p>
            <div className="flex items-end gap-4 mb-4">
              <span className="font-['Inter_Tight',system-ui,sans-serif] font-bold text-5xl text-[#F4F1EA]">{score}</span>
              <span className="text-[#A7AFBA] font-mono text-sm mb-2">/ 100 — {maturity}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'linear-gradient(90deg,#0c1018,#1a2030)', boxShadow: '0 1px 3px rgba(0,0,0,0.5) inset' }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${score}%`, background: 'linear-gradient(90deg,#aee038,#c7ff4a,#d8ff6a)', boxShadow: '0 0 8px rgba(199,255,74,0.4)' }} />
            </div>
            {currency && HOURS_COST_MAP[answers.manualWork] > 0 && (() => {
              const weeklyHours = HOURS_COST_MAP[answers.manualWork] ?? 0;
              const annualUsd = weeklyHours * 52 * 25;
              const annualLocal = Math.round(annualUsd * currency.rate);
              const costLabel: Record<Lang, string> = { he: 'עלות עבודה ידנית שנתית משוערת', en: 'Est. annual manual work cost', es: 'Costo anual estimado de trabajo manual', ru: 'Ориентировочные годовые затраты на ручной труд' };
              return (
                <div className="border-t border-[rgba(244,241,234,0.08)] pt-4">
                  <p className="font-mono text-xs text-[#A7AFBA]/60 uppercase tracking-widest mb-1">{costLabel[lang]}</p>
                  <p className="font-bold text-2xl text-[#FF7A59]">{currency.symbol}{annualLocal.toLocaleString()}</p>
                  <p className="text-xs text-[#A7AFBA]/50 mt-0.5 font-mono">{currency.code} @ $25/hr × {weeklyHours}h/wk × 52</p>
                </div>
              );
            })()}
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-[#A7AFBA]">
          <span>{step + 1} / {QUESTIONS.length}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg,#0c1018,#141a24)', boxShadow: '0 1px 3px rgba(0,0,0,0.5) inset' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#aee038,#c7ff4a)', boxShadow: '0 0 6px rgba(199,255,74,0.35)' }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ background: 'linear-gradient(160deg,rgba(255,255,255,0.055) 0%,#151A23 30%,#111620 100%)', border: '1px solid rgba(255,255,255,0.1)', borderBottomColor: 'rgba(0,0,0,0.4)', boxShadow: 'var(--v-shadow-md)', borderRadius: '1rem', padding: '1.5rem 2rem' }}>
        <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-6">
          {getLabel(currentQ.question, lang)}
        </h2>
        <div className="space-y-2">
          {(currentQ.options as any[]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="w-full text-start px-4 py-3.5 rounded-xl text-sm transition-all duration-150"
              style={selected === opt.value
                ? { background: 'linear-gradient(160deg,rgba(199,255,74,0.1) 0%,rgba(199,255,74,0.04) 100%)', border: '1px solid rgba(199,255,74,0.45)', color: '#F4F1EA', boxShadow: 'var(--v-shadow-sm)' }
                : { background: 'linear-gradient(160deg,rgba(255,255,255,0.04) 0%,#151a23 100%)', border: '1px solid rgba(255,255,255,0.08)', borderBottomColor: 'rgba(0,0,0,0.35)', color: '#A7AFBA', boxShadow: 'var(--v-shadow-sm)' }
              }
            >
              {getLabel(opt.label, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={handleBack} disabled={step === 0} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-mono">
          {lang === 'he' ? '→' : '←'} {t.back}
        </button>
        <button
          onClick={step === QUESTIONS.length - 1
            ? () => { if (selected) { setSession((s) => ({ ...s, answers: { ...s.answers, [currentQ.id]: selected }, selected: '', step: s.step + 1 })); } }
            : handleNext}
          disabled={!selected}
          className="font-semibold text-sm px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: 'linear-gradient(180deg,#d6ff5e 0%,#c7ff4a 45%,#aee038 100%)', color: '#0E1117', boxShadow: 'var(--v-shadow-accent)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {step === QUESTIONS.length - 1 ? t.seeResults : t.next} {lang === 'he' ? '←' : '→'}
        </button>
      </div>
    </div>
  );
}
