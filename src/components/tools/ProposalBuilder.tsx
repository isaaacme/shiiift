import { useState, useEffect } from 'react';
import ToolResult, { useToolSession, trackEvent } from './ToolResult';

type Lang = 'he' | 'en' | 'es' | 'ru';
type T = { back: string; next: string; seeResults: string; startOver: string; yourScore: string; topFindings: string; quickWins: string; nextActions: string; relatedTools: string; newsletterTitle: string; newsletterPlaceholder: string; newsletterCta: string; newsletterDisclaimer: string; lang: string };

function gl(o: Record<string, string>, l: string) { return o[l] ?? o['en'] ?? ''; }

const QS = [
  {
    id: 'target',
    q: {
      he: 'מהי המטרה העסקית העיקרית שלך כעת?',
      en: 'What is your primary business goal right now?',
      es: '¿Cuál es tu objetivo comercial principal ahora?',
      ru: 'Какова ваша главная бизнес-цель сейчас?',
    },
    opts: [
      { v: 'leads', l: { he: 'הגדלת כמות הלידים ושיפור אחוזי המרה', en: 'Increase leads & conversion rate', es: 'Aumentar leads y tasa de conversión', ru: 'Увеличение лидов и конверсии' } },
      { v: 'ops', l: { he: 'חסכון בשעות עבודה וצמצום משימות ידניות', en: 'Save work hours & reduce manual tasks', es: 'Ahorrar horas de trabajo y reducir tareas manuales', ru: 'Экономия часов и сокращение рутины' } },
      { v: 'stack', l: { he: 'איחוד ופישוט מחסנית הכלים והתוכנות', en: 'Consolidate & simplify tool stack', es: 'Consolidar y simplificar el stack de herramientas', ru: 'Объединение и упрощение стека программ' } },
    ],
  },
  {
    id: 'bottleneck',
    q: {
      he: 'איפה נמצא צוואר הבקבוק המשמעותי ביותר?',
      en: 'Where is your most significant operational bottleneck?',
      es: '¿Dónde está tu cuello de botella operativo más importante?',
      ru: 'Где находится самое узкое место в процессах?',
    },
    opts: [
      { v: 'whatsapp', l: { he: 'שיחות WhatsApp מבולגנות ללא תיעוד ומעקב', en: 'Messy WhatsApp chats with no tracking or CRM log', es: 'Chats de WhatsApp desorganizados y sin registro en CRM', ru: 'Хаос в WhatsApp, сообщения не заносятся в CRM' } },
      { v: 'data_entry', l: { he: 'עבודה כפולה והזנת נתונים ידנית בין מערכות', en: 'Double-entry & manual copy-paste between tools', es: 'Doble entrada y copiar-pegar manual entre herramientas', ru: 'Ручной перенос данных и копипаст между программами' } },
      { v: 'no_crm', l: { he: 'אין CRM מוגדר, הלידים מפוזרים בגליונות אקסל', en: 'No structured CRM, leads scattered in spreadsheets', es: 'Sin CRM estructurado, leads dispersos en planillas', ru: 'Нет CRM, лиды теряются в таблицах Excel/Sheets' } },
      { v: 'conversion', l: { he: 'מבקרים מגיעים לאתר אך לא משאירים פרטים', en: 'Visitors arrive at the website but do not convert', es: 'Los visitantes llegan al sitio pero no se convierten', ru: 'Посетители заходят на сайт, но не оставляют заявок' } },
    ],
  },
  {
    id: 'budget',
    q: {
      he: 'מהו סדר הגודל של התקציב המתוכנן לפרויקט?',
      en: 'What is the planned budget scale for this project?',
      es: '¿Cuál es la escala de presupuesto para este proyecto?',
      ru: 'Каков планируемый масштаб бюджета на проект?',
    },
    opts: [
      { v: 'tier1', l: { he: 'עד $5,000 (פרויקט פשוט / נקודתי)', en: 'Under $5,000 (Focused implementation)', es: 'Bajo $5,000 (Implementación enfocada)', ru: 'До $5,000 (Локальное решение / интеграция)' } },
      { v: 'tier2', l: { he: '$5,000 – $12,000 (פרויקט מותאם / אינטגרציה מלאה)', en: '$5,000 – $12,000 (Custom / Full integration)', es: '$5,000 – $12,000 (Personalizado / Integración completa)', ru: '$5,000 – $12,000 (Кастомный проект / полная интеграция)' } },
      { v: 'tier3', l: { he: '$12,000+ (פיתוח מורכב / מבוסס קוד / AI)', en: '$12,000+ (Advanced development / AI workflows)', es: '$12,000+ (Desarrollo avanzado / IA)', ru: '$12,000+ (Сложная разработка / ИИ-системы)' } },
    ],
  },
];

function generateProposalText(answers: Record<string, string>, lang: Lang): string {
  const target = answers.target || 'ops';
  const bottleneck = answers.bottleneck || 'data_entry';
  const budget = answers.budget || 'tier1';

  const props = {
    he: {
      title: 'הצעת פרויקט ליישום טכנולוגי — Shift Operating System',
      problem: 'הגדרת הבעיה וצוואר הבקבוק:',
      problemText: {
        whatsapp: 'פעילות מול לקוחות ב-WhatsApp מתנהלת ללא סנכרון תפעולי, מה שמוביל לאובדן לידים ולחוסר מעקב תפעולי בזמן אמת.',
        data_entry: 'עובדים מבזבזים שעות שבועיות יקרות על העתקה והקלדה ידנית של נתונים בין מערכות שונות במקום להתמקד בעבודה יוצרת ערך.',
        no_crm: 'מידע על לקוחות ולידים מפוזר בקבצים שונים. אין אמת תפעולית אחת, מה שמקשה על מעקב סגירת עסקאות ושימור לקוחות.',
        conversion: 'האתר הקיים אינו משמש ככלי סינון ומכירות אפקטיבי. משתמשים מבקרים באתר אך אחוז ההמרה נמוך מהרצוי.',
      }[bottleneck] || '',
      solution: 'פתרון מוצע ומבנה היישום:',
      solutionText: {
        leads: 'הקמת מערכת איסוף וסינון לידים אוטומטית, חיבור טפסים חכמים, והטמעת תהליכי מעקב אוטומטיים במייל וב-SMS להעלאת יחסי ההמרה.',
        ops: 'בניית אוטומציה מרכזית לחיבור ערוצי התקשורת (Email/WhatsApp) ישירות למערכת הניהול, כולל סנכרון נתונים דו-כיווני בזמן אמת.',
        stack: 'ארגון מחדש של מחסנית הכלים, הסרת תוכנות כפולות, והקמת תשתית אינטגרציה מאוחדת (Zapier/Make/n8n) לניהול זרימת המידע.',
      }[target] || '',
      deliverables: 'תוצרים מרכזיים:',
      delList: {
        whatsapp: ['1. חיבור API ל-WhatsApp Business', '2. אוטומציית סנכרון שיחות והודעות ל-CRM', '3. הגדרת התראות אוטומטיות לצוות המכירות'],
        data_entry: ['1. בניית תרחישי אוטומציה מרכזיים (Make/n8n)', '2. סנכרון לקוחות וחשבוניות אוטומטי', '3. הפחתת 90% מהעבודה הידנית בנושא'],
        no_crm: ['1. אפיון והקמת CRM מותאם (HubSpot/Pipedrive/Airtable)', '2. יצירת לוחות בקרה ומעקב עסקאות', '3. הדרכת צוות מעשית'],
        conversion: ['1. אופטימיזציית משפכי המרה ועיצוב דפי נחיתה', '2. אינטגרציה לטפסים מהירים ו-Calendly', '3. הגדרת מדדי GA4 ומעקב המרות מלא'],
      }[bottleneck] || [],
      budget: 'הערכת השקעה מוערכת:',
      budgetText: {
        tier1: 'הפרויקט מתוכנן כספרינט ממוקד של 2-3 שבועות בעלות מוערכת של $3,000 - $5,000.',
        tier2: 'הפרויקט מתוכנן כיישום רחב של 4-6 שבועות, כולל אינטגרציות מלאות ובדיקות עומסים, בעלות מוערכת של $6,000 - $11,000.',
        tier3: 'פרויקט פיתוח מותאם הכולל תשתית AI או קוד ייעודי, ליווי של 8+ שבועות, בעלות מוערכת של $12,000+.',
      }[budget] || '',
    },
    en: {
      title: 'Technology Implementation Proposal — Shift OS',
      problem: 'Problem Definition & Bottleneck:',
      problemText: {
        whatsapp: 'Customer interaction on WhatsApp happens outside the business system, causing lead leakage and zero operational visibility.',
        data_entry: 'Team members spend hours copying and pasting data between isolated platforms instead of performing high-value tasks.',
        no_crm: 'Customer records and leads are scattered across offline sheets. Lack of a single source of truth slows down sales.',
        conversion: 'The website is a static brochure that fails to filter and capture inbound customer demand effectively.',
      }[bottleneck] || '',
      solution: 'Proposed Solution:',
      solutionText: {
        leads: 'Build an automated lead capture funnel, connect smart forms, and deploy automated email/WhatsApp follow-ups to increase conversion.',
        ops: 'Develop central automations to sync communication channels directly with CRM, ensuring zero manual data entry.',
        stack: 'Audit and streamline the current software subscriptions, eliminate redundancies, and build a unified sync core.',
      }[target] || '',
      deliverables: 'Key Deliverables:',
      delList: {
        whatsapp: ['1. WhatsApp Business API Setup', '2. Auto-log conversations to CRM', '3. Lead notification routing engine'],
        data_entry: ['1. Custom integrations via Make/n8n', '2. Automatic invoicing/payment syncing', '3. 90% reduction in manual data entry'],
        no_crm: ['1. Customized CRM installation (HubSpot/Pipedrive/Airtable)', '2. Automated deal-stage tracking dashboard', '3. Team onboarding & training session'],
        conversion: ['1. Conversion-focused layout & landing page redesign', '2. Instant lead capture forms & Calendly sync', '3. Full GA4 event tracking dashboard'],
      }[bottleneck] || [],
      budget: 'Estimated Investment:',
      budgetText: {
        tier1: 'Structured as a focused implementation sprint (2-3 weeks). Estimated budget: $3,000 - $5,000.',
        tier2: 'Structured as a custom integration project (4-6 weeks) with fully integrated testing. Estimated budget: $6,000 - $11,000.',
        tier3: 'Advanced custom code development or AI agent integration (8+ weeks). Estimated budget: $12,000+.',
      }[budget] || '',
    },
    es: {
      title: 'Propuesta de Implementación Tecnológica — Shift OS',
      problem: 'Definición del Problema:',
      problemText: {
        whatsapp: 'La comunicación con clientes por WhatsApp se gestiona fuera de los sistemas de negocio, perdiendo leads y visibilidad.',
        data_entry: 'El equipo pierde horas valiosas copiando y pegando datos manualmente entre herramientas desconectadas.',
        no_crm: 'Los datos de leads y clientes están dispersos en hojas de cálculo, sin un CRM estructurado.',
        conversion: 'El sitio web es una página estática que no logra calificar y capturar la demanda entrante de manera efectiva.',
      }[bottleneck] || '',
      solution: 'Solución Propuesta:',
      solutionText: {
        leads: 'Crear un embudo de captura automatizado, formularios inteligentes y seguimiento automático para subir la tasa de conversión.',
        ops: 'Desarrollar automatizaciones centrales para sincronizar canales de comunicación con el CRM, eliminando la carga manual.',
        stack: 'Auditar y optimizar las suscripciones de software, eliminando redundancias y construyendo una base de integración robusta.',
      }[target] || '',
      deliverables: 'Entregables Clave:',
      delList: {
        whatsapp: ['1. Configuración de API de WhatsApp Business', '2. Registro automático de chats en CRM', '3. Motor de notificaciones de leads en tiempo real'],
        data_entry: ['1. Integraciones a medida en Make/n8n', '2. Sincronización automática de facturas y cobros', '3. Reducción del 90% de la carga manual'],
        no_crm: ['1. Configuración de CRM personalizado (HubSpot/Pipedrive/Airtable)', '2. Tablero de control de etapas de ventas', '3. Capacitación práctica del equipo'],
        conversion: ['1. Rediseño de landing pages enfocado en conversión', '2. Formularios de captura rápida y sincronización de Calendly', '3. Configuración completa de GA4 y seguimiento de eventos'],
      }[bottleneck] || [],
      budget: 'Inversión Estimada:',
      budgetText: {
        tier1: 'Estructurado como sprint de implementación enfocado (2-3 semanas). Inversión: $3,000 - $5,000.',
        tier2: 'Proyecto de integración a medida completo (4-6 semanas) con pruebas exhaustivas. Inversión: $6,000 - $11,000.',
        tier3: 'Desarrollo avanzado a código abierto o flujos de IA avanzados (8+ semanas). Inversión: $12,000+.',
      }[budget] || '',
    },
    ru: {
      title: 'Предложение по внедрению технологий — Shift OS',
      problem: 'Описание проблемы и узкого места:',
      problemText: {
        whatsapp: 'Общение с клиентами в WhatsApp происходит хаотично, лиды теряются, история переписки не сохраняется в CRM.',
        data_entry: 'Сотрудники тратят часы на ручной перенос данных и копипаст между изолированными программами.',
        no_crm: 'Контакты и сделки разрознены по таблицам, нет единой базы клиентов и прозрачной воронки продаж.',
        conversion: 'Сайт является статической визиткой, которая не конвертирует входящий трафик в реальные заявки.',
      }[bottleneck] || '',
      solution: 'Рекомендуемое решение:',
      solutionText: {
        leads: 'Создание автоматизированной воронки захвата лидов, интеграция умных форм и авто-ответов по email/WhatsApp для роста конверсии.',
        ops: 'Разработка центральных сценариев автоматизации для связки каналов связи с CRM-системой без ручной работы.',
        stack: 'Аудит подписок, оптимизация стека программ, устранение дублирующих функций и создание единой интеграционной шины.',
      }[target] || '',
      deliverables: 'Основные результаты:',
      delList: {
        whatsapp: ['1. Подключение WhatsApp Business API', '2. Настройка автоматического сохранения диалогов в CRM', '3. Настройка оповещений о новых лидах'],
        data_entry: ['1. Создание сценариев интеграции на Make/n8n', '2. Автоматическая синхронизация счетов и оплат', '3. Сокращение рутинного ввода данных на 90%'],
        no_crm: ['1. Проектирование и внедрение CRM (HubSpot/Pipedrive/Airtable)', '2. Настройка дашборда воронки продаж', '3. Обучение и онбординг команды'],
        conversion: ['1. Оптимизация интерфейса и редизайн посадочной страницы', '2. Интеграция быстрых форм и календаря Calendly', '3. Настройка событий в GA4 и аналитики воронки'],
      }[bottleneck] || [],
      budget: 'Оценка бюджета проекта:',
      budgetText: {
        tier1: 'Спринт точечного внедрения (2–3 недели). Бюджет: $3,000 – $5,000.',
        tier2: 'Кастомный проект интеграции (4–6 недель) с комплексным тестированием. Бюджет: $6,000 – $11,000.',
        tier3: 'Сложная разработка или внедрение ИИ-ассистентов (8+ недель). Бюджет: $12,000+.',
      }[budget] || '',
    },
  };

  const current = props[lang] ?? props['en'];
  const bulletSymbol = '•';

  return [
    `=== ${current.title} ===`,
    '',
    `1. ${current.problem}`,
    current.problemText,
    '',
    `2. ${current.solution}`,
    current.solutionText,
    '',
    `3. ${current.deliverables}`,
    ...current.delList,
    '',
    `4. ${current.budget}`,
    current.budgetText,
    '',
    `shiiift.com | Generated on ${new Date().toLocaleDateString()}`
  ].join('\n');
}

export default function ProposalBuilder({ t }: { t: T }) {
  const lang = (t.lang || 'en') as Lang;
  const [session, setSession, clearSession] = useToolSession('proposal-builder', {
    step: 0,
    answers: {} as Record<string, string>,
    selected: '',
  });
  const { step, answers, selected } = session;

  const isResult = step >= QS.length;
  const cq = QS[step];

  const proposalText = isResult ? generateProposalText(answers, lang) : '';

  useEffect(() => {
    if (step === 0 && Object.keys(answers).length === 0) trackEvent('tool_started', { tool: 'proposal-builder', lang });
  }, []);

  useEffect(() => {
    if (isResult) trackEvent('tool_completed', { tool: 'proposal-builder', lang });
  }, [isResult]);

  const copyLabel = {
    he: 'העתק לקליפבורד',
    en: 'Copy to clipboard',
    es: 'Copiar al portapapeles',
    ru: 'Копировать в буфер',
  };

  const copiedLabel = {
    he: 'הועתק!',
    en: 'Copied!',
    es: '¡Copiado!',
    ru: 'Скопировано!',
  };

  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const findings = [
    {
      he: 'הצעה מותאמת אישית נוצרה בהצלחה',
      en: 'Personalised proposal compiled successfully',
      es: 'Propuesta personalizada generada con éxito',
      ru: 'Индивидуальное предложение успешно сформировано',
    },
  ].map((o) => gl(o, lang));

  const quickWins = [
    {
      he: 'הורד את נוסח ההצעה והתחל לעבוד לפיו כמפת דרכים ראשונית',
      en: 'Download this text draft to use as an initial roadmap',
      es: 'Descarga este borrador de texto para usarlo como mapa de ruta inicial',
      ru: 'Скачайте этот текст, чтобы использовать его как первоначальный план',
    },
  ].map((o) => gl(o, lang));

  const nextActions = [
    {
      he: 'שלח את ההצעה הזו ל-Shift לקבלת הצעת מחיר סופית ופגישת הכוון',
      en: 'Send this proposal draft to Shift for final scoping & kickoff',
      es: 'Envía este borrador de propuesta a Shift para definir el alcance final',
      ru: 'Отправьте этот черновик в Shift для финального согласования',
    },
  ].map((o) => gl(o, lang));

  if (isResult) {
    return (
      <ToolResult
        lang={lang}
        toolId="proposal-builder"
        t={t}
        answers={answers}
        findings={findings}
        quickWins={quickWins}
        nextActions={nextActions}
        onReset={clearSession}
        scoreBlock={
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-shift-accent mb-3">
              {lang === 'he' ? 'הצעת הפרויקט שלך' : lang === 'ru' ? 'Ваше коммерческое предложение' : lang === 'es' ? 'Tu propuesta de proyecto' : 'Your Project Proposal'}
            </p>
            <textarea
              readOnly
              value={proposalText}
              className="w-full h-64 p-3 rounded-lg text-xs font-mono bg-[#0c1018] border border-white/10 text-shift-text outline-none resize-none mb-3"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg text-xs font-mono bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-[#F4F1EA] border border-white/5 cursor-pointer"
            >
              {copied ? gl(copiedLabel, lang) : gl(copyLabel, lang)}
            </button>
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
