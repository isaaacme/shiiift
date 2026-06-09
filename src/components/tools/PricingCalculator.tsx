import { useState, useEffect } from 'react';
import ToolResult, { useToolSession, trackEvent } from './ToolResult';

type Lang = 'he' | 'en' | 'es' | 'ru';
type T = { back: string; next: string; seeResults: string; startOver: string; yourScore: string; topFindings: string; quickWins: string; nextActions: string; relatedTools: string; newsletterTitle: string; newsletterPlaceholder: string; newsletterCta: string; newsletterDisclaimer: string; lang: string };

function gl(o: Record<string, string>, l: string) { return o[l] ?? o['en'] ?? ''; }

const QS = [
  {
    id: 'size',
    q: {
      he: 'מה גודל הצוות / העסק שלך?',
      en: 'What is your team / business size?',
      es: '¿Cuál es el tamaño de tu equipo / negocio?',
      ru: 'Каков размер вашей команды / бизнеса?',
    },
    opts: [
      { v: 'small', l: { he: '1–5 אנשים (עסק קטן)', en: '1–5 people (Small business)', es: '1–5 personas (Pequeña empresa)', ru: '1–5 человек (Малый бизнес)' } },
      { v: 'mid', l: { he: '6–25 אנשים (עסק צומח)', en: '6–25 people (Growing business)', es: '6–25 personas (Empresa en crecimiento)', ru: '6–25 человек (Растущий бизнес)' } },
      { v: 'large', l: { he: '26–100 אנשים (עסק מבוסס)', en: '26–100 people (Established business)', es: '26–100 personas (Empresa consolidada)', ru: '26–100 человек (Устоявшийся бизнес)' } },
      { v: 'enterprise', l: { he: '100+ אנשים (ארגון גדול)', en: '100+ people (Large Enterprise)', es: '100+ personas (Gran empresa)', ru: '100+ человек (Крупное предприятие)' } },
    ],
  },
  {
    id: 'type',
    q: {
      he: 'איזה סוג פרויקט אתה צריך ליישם?',
      en: 'What type of project do you need to implement?',
      es: '¿Qué tipo de proyecto necesitas implementar?',
      ru: 'Какой тип проекта вам нужно реализовать?',
    },
    opts: [
      { v: 'website', l: { he: 'אתר תדמית או פורטל לקוחות', en: 'Website or Customer Portal', es: 'Sitio web o portal de clientes', ru: 'Сайт или портал для клиентов' } },
      { v: 'automation', l: { he: 'אוטומציות עסקיות ואינטגרציות', en: 'Business Automations & Integrations', es: 'Automatizaciones e integraciones de negocios', ru: 'Бизнес-автоматизация и интеграция' } },
      { v: 'internal_tool', l: { he: 'מערכת פנימית מותאמת או CRM', en: 'Custom CRM or Internal Admin Tool', es: 'CRM personalizado o herramienta de administración interna', ru: 'Собственная CRM или внутренний инструмент' } },
      { v: 'ai_workflow', l: { he: 'מערכת AI או סינון לידים חכם', en: 'AI Workflow or Lead Qualification System', es: 'Flujo de trabajo de IA o sistema de calificación de leads', ru: 'ИИ-процесс или умная квалификация лидов' } },
    ],
  },
  {
    id: 'complexity',
    q: {
      he: 'מה רמת המורכבות / התאמה אישית הנדרשת?',
      en: 'What is the required level of complexity / customisation?',
      es: '¿Cuál es el nivel requerido de complejidad / personalización?',
      ru: 'Каков требуемый уровень сложности / кастомизации?',
    },
    opts: [
      { v: 'standard', l: { he: 'בסיסית (חיבור כלים קיימים, תבניות סטנדרטיות)', en: 'Basic (Connecting existing tools, standard templates)', es: 'Básica (Conectar herramientas existentes, plantillas estándar)', ru: 'Базовый (Подключение готовых инструментов, шаблоны)' } },
      { v: 'custom', l: { he: 'בינונית (לוגיקה מותאמת, מספר מערכות, מסד נתונים)', en: 'Medium (Custom logic, multiple systems, database)', es: 'Mediana (Lógica personalizada, múltiples sistemas, base de datos)', ru: 'Средний (Своя логика, несколько систем, база данных)' } },
      { v: 'complex', l: { he: 'גבוהה (קוד ייעודי, פיתוח API, תהליכים מורכבים)', en: 'High (Custom code, API development, complex flows)', es: 'Alta (Código a medida, desarrollo de API, flujos complejos)', ru: 'Высокий (Свой код, разработка API, сложные потоки)' } },
    ],
  },
  {
    id: 'timeline',
    q: {
      he: 'מהו לוח הזמנים המתוכנן?',
      en: 'What is your planned timeline?',
      es: '¿Cuál es tu plazo planificado?',
      ru: 'Каковы ваши планируемые сроки?',
    },
    opts: [
      { v: 'flexible', l: { he: 'סטנדרטי (4–8 שבועות)', en: 'Standard (4–8 weeks)', es: 'Estándar (4–8 semanas)', ru: 'Стандартный (4–8 недель)' } },
      { v: 'urgent', l: { he: 'מהיר (2–4 שבועות)', en: 'Fast (2–4 weeks)', es: 'Rápido (2–4 semanas)', ru: 'Быстрый (2–4 недели)' } },
      { v: 'critical', l: { he: 'דחוף / מיידי (פחות מ-2 שבועות)', en: 'Critical / ASAP (Under 2 weeks)', es: 'Crítico / ASAP (Menos de 2 semanas)', ru: 'Критический / Срочно (Менее 2 недель)' } },
    ],
  },
];

const BASE_PRICES: Record<string, number> = {
  website: 4500,
  automation: 3500,
  internal_tool: 6000,
  ai_workflow: 5000,
};

const MULTIPLIERS = {
  size: { small: 1.0, mid: 1.25, large: 1.5, enterprise: 2.0 } as Record<string, number>,
  complexity: { standard: 1.0, custom: 1.45, complex: 1.95 } as Record<string, number>,
  timeline: { flexible: 1.0, urgent: 1.25, critical: 1.6 } as Record<string, number>,
};

export default function PricingCalculator({ t }: { t: T }) {
  const lang = (t.lang || 'en') as Lang;
  const [session, setSession, clearSession] = useToolSession('pricing-calculator', {
    step: 0,
    answers: {} as Record<string, string>,
    selected: '',
  });
  const { step, answers, selected } = session;

  const isResult = step >= QS.length;
  const cq = QS[step];

  // Calculate pricing tier
  const type = answers.type || 'automation';
  const size = answers.size || 'small';
  const complexity = answers.complexity || 'standard';
  const timeline = answers.timeline || 'flexible';

  const basePrice = BASE_PRICES[type] ?? 4000;
  const multSize = MULTIPLIERS.size[size] ?? 1.0;
  const multComp = MULTIPLIERS.complexity[complexity] ?? 1.0;
  const multTime = MULTIPLIERS.timeline[timeline] ?? 1.0;

  const calculated = Math.round(basePrice * multSize * multComp * multTime);
  const minPrice = Math.round((calculated * 0.9) / 500) * 500;
  const maxPrice = Math.round((calculated * 1.15) / 500) * 500;

  const currencySign = '$';

  // Staging / Resource requirements recommendations
  const sprints = timeline === 'flexible' ? '1–2 sprints' : timeline === 'urgent' ? '2–3 sprints' : '4+ sprints';
  const resourceLabel = {
    he: `הערכת משאבים: ${sprints} · מפתח ייעודי`,
    en: `Resources: ${sprints} · Dedicated Developer`,
    es: `Recursos: ${sprints} · Desarrollador dedicado`,
    ru: `Ресурсы: ${sprints} · Выделенный разработчик`,
  };

  const findings = [
    {
      he: `בסיס פרויקט: ${gl({ website: 'אתר/פורטל', automation: 'אוטומציות', internal_tool: 'כלי CRM/פנימי', ai_workflow: 'זרימת AI' }[type] || {}, lang)}`,
      en: `Project Base: ${gl({ website: 'Website/Portal', automation: 'Automations', internal_tool: 'CRM/Internal tool', ai_workflow: 'AI Flow' }[type] || {}, lang)}`,
      es: `Base de proyecto: ${gl({ website: 'Sitio/Portal', automation: 'Automatizaciones', internal_tool: 'CRM/Herramienta interna', ai_workflow: 'Flujo de IA' }[type] || {}, lang)}`,
      ru: `База проекта: ${gl({ website: 'Сайт/Портал', automation: 'Автоматизация', internal_tool: 'CRM/Внутренний инструмент', ai_workflow: 'ИИ-процесс' }[type] || {}, lang)}`,
    },
    {
      he: `רמת מורכבות: ${gl({ standard: 'סטנדרטית', custom: 'מותאמת אישית', complex: 'מורכבת מאוד' }[complexity] || {}, lang)}`,
      en: `Complexity level: ${gl({ standard: 'Standard', custom: 'Customised', complex: 'Highly complex' }[complexity] || {}, lang)}`,
      es: `Nivel de complejidad: ${gl({ standard: 'Estándar', custom: 'Personalizada', complex: 'Muy compleja' }[complexity] || {}, lang)}`,
      ru: `Уровень сложности: ${gl({ standard: 'Стандартный', custom: 'Кастомный', complex: 'Высокосложный' }[complexity] || {}, lang)}`,
    },
    {
      he: `דחיפות זמן: ${gl({ flexible: 'רגילה (4–8 שבועות)', urgent: 'מהירה (2–4 שבועות)', critical: 'קריטית (מתחת לשבועיים)' }[timeline] || {}, lang)}`,
      en: `Timeline Urgency: ${gl({ flexible: 'Standard (4–8 weeks)', urgent: 'Fast (2–4 weeks)', critical: 'Critical (Under 2 weeks)' }[timeline] || {}, lang)}`,
      es: `Plazo de entrega: ${gl({ flexible: 'Estándar (4–8 semanas)', urgent: 'Rápido (2–4 semanas)', critical: 'Crítico (Menos de 2 semanas)' }[timeline] || {}, lang)}`,
      ru: `Срочность: ${gl({ flexible: 'Стандартная (4–8 недель)', urgent: 'Быстрая (2–4 недели)', critical: 'Критическая (Менее 2 недель)' }[timeline] || {}, lang)}`,
    },
  ].map((o) => gl(o, lang));

  const quickWins = [
    {
      he: 'פצל פרויקט לשלבים קטנים כדי לצמצם את סיכון התקציב',
      en: 'Phase the implementation to reduce initial budget risk',
      es: 'Divide el proyecto en fases para reducir el riesgo del presupuesto inicial',
      ru: 'Разделите проект на этапы, чтобы снизить риски на старте',
    },
    {
      he: 'הגדר במדויק את הכלים שישולבו כדי למנוע חריגת היקף',
      en: 'Pre-define tool connections explicitly to prevent scope creep',
      es: 'Define las conexiones de herramientas de antemano para evitar cambios en el alcance',
      ru: 'Заранее определите интеграции, чтобы избежать раздувания рамок',
    },
    {
      he: 'השתמש ברכיבים מוכנים תחילה כדי לחסוך שעות פיתוח',
      en: 'Leverage pre-built components first to save development hours',
      es: 'Usa componentes preconstruidos primero para ahorrar horas de desarrollo',
      ru: 'Используйте готовые компоненты на первом этапе для экономии часов',
    },
  ].map((o) => gl(o, lang));

  const nextActions = [
    {
      he: 'הורד את הערכת התקציב ושלח בקשה לשיחת אפיון מדויקת',
      en: 'Download this estimate and request an execution scope call',
      es: 'Descarga esta estimación y solicita una llamada de definición de alcance',
      ru: 'Скачайте эту оценку и запросите звонок для уточнения объема работ',
    },
    {
      he: 'סקור את רישיונות הכלים (Zapier, CRMs) שיהיו נחוצים לפרויקט',
      en: 'Review the software subscriptions needed for the integration',
      es: 'Revisa las suscripciones de software necesarias para la integración',
      ru: 'Проверьте подписки на софт, необходимые для интеграции',
    },
  ].map((o) => gl(o, lang));

  useEffect(() => {
    if (step === 0 && Object.keys(answers).length === 0) trackEvent('tool_started', { tool: 'pricing-calculator', lang });
  }, []);

  useEffect(() => {
    if (isResult) trackEvent('tool_completed', { tool: 'pricing-calculator', lang, calculated: String(calculated) });
  }, [isResult]);

  if (isResult) {
    return (
      <ToolResult
        lang={lang}
        toolId="pricing-calculator"
        t={t}
        answers={answers}
        findings={findings}
        quickWins={quickWins}
        nextActions={nextActions}
        onReset={clearSession}
        scoreBlock={
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-shift-accent mb-3">{t.yourScore}</p>
            <div className="flex items-end gap-3 mb-1">
              <span className="font-bold text-4xl text-[#C7FF4A]" style={{ fontFamily: "'Inter Tight', system-ui, sans-serif" }}>
                {currencySign}{minPrice.toLocaleString()} – {currencySign}{maxPrice.toLocaleString()}
              </span>
              <span className="text-sm text-shift-muted mb-1">USD</span>
            </div>
            <p className="text-xs font-mono text-shift-muted mt-2">
              {gl(resourceLabel, lang)}
            </p>
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
          <div className="shift-progress-fill" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>
      <div className="shift-card">
        <h2 className="font-heading font-semibold text-xl text-shift-text mb-6">{gl(cq.q, lang)}</h2>
        <div className="space-y-2">
          {cq.opts.map((o) => {
            const isSelected = selected === o.v;
            return (
              <button key={o.v} onClick={() => setSession((s) => ({ ...s, selected: o.v }))}
                className={`w-full text-start px-4 py-3.5 rounded-xl text-sm transition-all duration-150 shift-option-btn ${isSelected ? 'shift-option-btn-selected' : ''}`}
              >
                {gl(o.l, lang)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (step === 0) return; const pq = QS[step-1]; setSession((s) => ({...s, step:s.step-1, selected:s.answers[pq.id]||''})); }}
          disabled={step === 0} className="text-sm text-shift-muted hover:text-shift-text disabled:opacity-30 disabled:cursor-not-allowed font-mono transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shift-accent focus-visible:ring-offset-2 focus-visible:ring-offset-shift-bg rounded px-1">{lang === 'he' ? '→' : '←'} {t.back}
        </button>
        <button
          onClick={() => { if (!selected) return; setSession((s) => ({...s, answers:{...s.answers,[cq.id]:selected}, selected:'', step:s.step+1})); }}
          disabled={!selected}
          className="px-6 py-2.5 rounded-xl font-heading font-semibold text-sm text-shift-bg bg-shift-accent hover:bg-[#7df0ff] hover:text-shift-text active:scale-95 transition-all shadow-volume-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-shift-accent focus-visible:ring-offset-2 focus-visible:ring-offset-shift-bg cursor-pointer border border-white/15 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === QS.length - 1 ? t.seeResults : t.next} {lang === 'he' ? '←' : '→'}
        </button>
      </div>
    </div>
  );
}
