import { useState, useEffect } from 'react';
import ToolResult from './ToolResult';
import { useToolSession, trackEvent } from './useToolSession';

type Lang = 'he' | 'en' | 'es' | 'ru';
type T = { back: string; next: string; seeResults: string; startOver: string; yourScore: string; topFindings: string; quickWins: string; nextActions: string; relatedTools: string; newsletterTitle: string; newsletterPlaceholder: string; newsletterCta: string; newsletterDisclaimer: string; lang: string };

function gl(o: Record<string, string>, l: string) { return o[l] ?? o['en'] ?? ''; }

const TOOL_LOGO: Record<string, string> = {
  crm: 'hubspot.com',
  email: 'mailchimp.com',
  project: 'notion.so',
  accounting: 'quickbooks.intuit.com',
  scheduling: 'calendly.com',
  communication: 'slack.com',
  docs: 'notion.so',
  analytics: 'analytics.google.com',
  forms: 'typeform.com',
  automation: 'zapier.com',
};

const TOOL_OPTIONS = [
  { v: 'crm', l: { he: 'CRM', en: 'CRM', es: 'CRM', ru: 'CRM' } },
  { v: 'email', l: { he: 'אימייל / ניוזלטר', en: 'Email / Newsletter', es: 'Email / Newsletter', ru: 'Email / Рассылка' } },
  { v: 'project', l: { he: 'ניהול פרויקטים', en: 'Project management', es: 'Gestión de proyectos', ru: 'Управление проектами' } },
  { v: 'accounting', l: { he: 'הנהלת חשבונות', en: 'Accounting', es: 'Contabilidad', ru: 'Бухгалтерия' } },
  { v: 'scheduling', l: { he: 'לוחות זמנים / תורים', en: 'Scheduling / Appointments', es: 'Agenda / Citas', ru: 'Расписание / Запись' } },
  { v: 'communication', l: { he: 'תקשורת צוות', en: 'Team communication', es: 'Comunicación del equipo', ru: 'Командное общение' } },
  { v: 'docs', l: { he: 'מסמכים / ידע', en: 'Docs / Knowledge base', es: 'Documentos / Base de conocimiento', ru: 'Документы / База знаний' } },
  { v: 'analytics', l: { he: 'אנליטיקס / דוחות', en: 'Analytics / Reporting', es: 'Analítica / Informes', ru: 'Аналитика / Отчёты' } },
  { v: 'forms', l: { he: 'טפסים / סקרים', en: 'Forms / Surveys', es: 'Formularios / Encuestas', ru: 'Формы / Опросы' } },
  { v: 'automation', l: { he: 'אוטומציה (Zapier / Make)', en: 'Automation (Zapier / Make)', es: 'Automatización (Zapier / Make)', ru: 'Автоматизация (Zapier / Make)' } },
];

const PAIN_OPTIONS = [
  { v: 'duplicate', l: { he: 'כפולים — אותו מידע נכנס ביותר ממקום אחד', en: 'Duplicates — same data entered in multiple places', es: 'Duplicados — mismos datos en varios lugares', ru: 'Дубликаты — одни данные вводятся в нескольких местах' } },
  { v: 'disconnected', l: { he: 'כלים לא מחוברים אחד לשני', en: 'Tools don\'t connect to each other', es: 'Las herramientas no se conectan entre sí', ru: 'Инструменты не связаны между собой' } },
  { v: 'toomany', l: { he: 'יותר מדי כלים לאותה מטרה', en: 'Too many tools for the same purpose', es: 'Demasiadas herramientas para el mismo propósito', ru: 'Слишком много инструментов для одной цели' } },
  { v: 'unused', l: { he: 'כלים שמשלמים עליהם אבל לא משתמשים', en: 'Tools you pay for but don\'t use', es: 'Herramientas que pagas pero no usas', ru: 'Инструменты, за которые платите, но не используете' } },
  { v: 'expensive', l: { he: 'עלויות גבוהות מדי', en: 'Too expensive overall', es: 'Demasiado caro en total', ru: 'Слишком дорого в целом' } },
];

const ADVICE: Record<string, Record<string, string>> = {
  crm: { he: 'הגדר HubSpot/Pipedrive כמרכז — חבר כל כלי אחר אליו', en: 'Set HubSpot/Pipedrive as your hub — connect everything else to it', es: 'Configura HubSpot/Pipedrive como centro — conecta todo lo demás', ru: 'Сделайте HubSpot/Pipedrive центром — подключите всё остальное к нему' },
  duplicate: { he: 'מפה הזנות כפולות ובנה זרימת Zapier/Make לסנכרון', en: 'Map duplicate entries and build a Zapier/Make sync flow', es: 'Mapea entradas duplicadas y construye un flujo Zapier/Make', ru: 'Определите дублирующиеся записи и создайте поток синхронизации в Zapier/Make' },
  disconnected: { he: 'בחר כלי אינטגרציה אחד (Zapier/Make/n8n) וחבר את 3 הכלים הכי חשובים', en: 'Pick one integration tool (Zapier/Make/n8n) and connect your top 3 tools', es: 'Elige una herramienta de integración (Zapier/Make/n8n) y conecta tus 3 principales', ru: 'Выберите один инструмент интеграции (Zapier/Make/n8n) и подключите 3 главных инструмента' },
  toomany: { he: 'בחר כלי אחד מקיף (כגון Notion/Monday) לפני שמוסיפים עוד', en: 'Consolidate into one comprehensive tool before adding more', es: 'Consolida en una herramienta completa antes de agregar más', ru: 'Объедините в один комплексный инструмент перед добавлением новых' },
  unused: { he: 'בטל מנויים שלא השתמשת בהם 3 חודשים — חסוך ועיין מחדש', en: 'Cancel subscriptions unused for 3 months — save and reassess', es: 'Cancela suscripciones sin usar por 3 meses — ahorra y reevalúa', ru: 'Отмените подписки, неиспользуемые 3 месяца — сэкономьте и пересмотрите' },
};

export default function ToolStackSimplifier({ t }: { t: T }) {
  const lang = (t.lang || 'en') as Lang;
  const [session, setSession, clearSession] = useToolSession('tool-stack', { step: 0, tools: [] as string[], pains: [] as string[] });
  const { step, tools, pains } = session;

  const isResult = step >= 2;

  const advice = [...tools.filter((t) => ADVICE[t]), ...pains.filter((p) => ADVICE[p])].map((k) => ADVICE[k]);
  const keep = tools.filter((t) => ['crm', 'automation'].includes(t));
  const review = tools.filter((t) => !['crm', 'automation'].includes(t));

  const lbl = {
    keep: { he: 'שמור', en: 'Keep', es: 'Conservar', ru: 'Оставить' },
    review: { he: 'בדוק מחדש', en: 'Review', es: 'Revisar', ru: 'Пересмотреть' },
    toolsQ: { he: 'אילו כלים אתה משתמש בהם?', en: 'Which tools do you use?', es: '¿Qué herramientas usas?', ru: 'Какими инструментами вы пользуетесь?' },
    painQ: { he: 'מה הכי מתסכל אותך?', en: 'What frustrates you most?', es: '¿Qué te frustra más?', ru: 'Что вас больше всего раздражает?' },
    selectAll: { he: 'בחר הכל שרלוונטי', en: 'Select all that apply', es: 'Selecciona todo lo que aplique', ru: 'Выберите все подходящие' },
  };

  const nextActions = [
    pains.includes('disconnected') && { he: 'בחר Zapier/Make/n8n כשכבת אינטגרציה ובנה זרימה אחת היום', en: 'Choose Zapier/Make/n8n as integration layer and build one flow today', es: 'Elige Zapier/Make/n8n como capa de integración y construye un flujo hoy', ru: 'Выберите Zapier/Make/n8n и создайте один поток сегодня' },
    pains.includes('unused') && { he: 'בטל מנויים שלא השתמשת בהם ב-90 יום — חסוך ≥$50/חודש', en: 'Cancel subscriptions unused in 90 days — save ≥$50/month', es: 'Cancela suscripciones sin usar en 90 días — ahorra ≥$50/mes', ru: 'Отмените неиспользуемые 90 дней подписки — сэкономьте ≥$50/мес' },
    !tools.includes('crm') && { he: 'הגדר CRM בסיסי — הוא חיבור הכלים החשוב ביותר שלך', en: 'Set up a basic CRM — it\'s your most important tool connection', es: 'Configura un CRM básico — es tu conexión de herramientas más importante', ru: 'Настройте базовый CRM — это самое важное соединение инструментов' },
  ].filter(Boolean).slice(0, 3).map((a: any) => gl(a, lang));

  useEffect(() => {
    if (step === 0 && tools.length === 0) trackEvent('tool_started', { tool: 'tool-stack', lang });
  }, []);
  useEffect(() => {
    if (isResult) trackEvent('tool_completed', { tool: 'tool-stack', lang, tools: tools.length.toString() });
  }, [isResult]);

  if (isResult) {
    return (
      <ToolResult
        lang={lang}
        toolId="tool-stack"
        t={t}
        answers={{ pains }}
        quickWins={advice.slice(0, 3).map((a) => gl(a, lang))}
        nextActions={nextActions}
        onReset={clearSession}
        scoreBlock={
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="font-mono text-xs text-[#C7FF4A] uppercase tracking-widest mb-3">{gl(lbl.keep, lang)}</p>
              {keep.length > 0 ? keep.map((t) => {
                const opt = TOOL_OPTIONS.find((o) => o.v === t);
                const logo = TOOL_LOGO[t];
                return (
                  <div key={t} className="flex items-center gap-2 mb-2">
                    {logo && <img src={`https://logo.clearbit.com/${logo}`} alt="" width="16" height="16" className="rounded w-4 h-4 object-contain flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    <p className="text-sm text-[#F4F1EA]">{opt ? gl(opt.l, lang) : t}</p>
                  </div>
                );
              }) : <p className="text-xs text-[#A7AFBA]">—</p>}
            </div>
            <div>
              <p className="font-mono text-xs text-[#FF7A59] uppercase tracking-widest mb-3">{gl(lbl.review, lang)}</p>
              {review.length > 0 ? review.map((t) => {
                const opt = TOOL_OPTIONS.find((o) => o.v === t);
                const logo = TOOL_LOGO[t];
                return (
                  <div key={t} className="flex items-center gap-2 mb-2">
                    {logo && <img src={`https://logo.clearbit.com/${logo}`} alt="" width="16" height="16" className="rounded w-4 h-4 object-contain flex-shrink-0 opacity-50" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    <p className="text-sm text-[#A7AFBA]">{opt ? gl(opt.l, lang) : t}</p>
                  </div>
                );
              }) : <p className="text-xs text-[#A7AFBA]">—</p>}
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-[#A7AFBA]"><span>{step + 1} / 2</span><span>{step * 50}%</span></div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg,#0c1018,#141a24)', boxShadow: '0 1px 3px rgba(0,0,0,0.5) inset' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${step * 50}%`, background: 'linear-gradient(90deg,#4dcfed,#6ee7f9)', boxShadow: '0 0 6px rgba(110,231,249,0.35)' }} />
        </div>
      </div>

      <div style={{ background: 'linear-gradient(160deg,rgba(255,255,255,0.055) 0%,#151A23 30%,#111620 100%)', border: '1px solid rgba(255,255,255,0.1)', borderBottomColor: 'rgba(0,0,0,0.4)', boxShadow: 'var(--v-shadow-md)', borderRadius: '1rem', padding: '1.5rem 2rem' }}>
        <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-2">{gl(step === 0 ? lbl.toolsQ : lbl.painQ, lang)}</h2>
        <p className="text-xs text-[#A7AFBA]/60 font-mono mb-5">{gl(lbl.selectAll, lang)}</p>
        {step === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TOOL_OPTIONS.map((o) => (
              <button key={o.v} onClick={() => setSession((s) => ({ ...s, tools: s.tools.includes(o.v) ? s.tools.filter((x) => x !== o.v) : [...s.tools, o.v] }))}
                className="text-start px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3"
                style={tools.includes(o.v)
                  ? { background: 'linear-gradient(160deg,rgba(110,231,249,0.1) 0%,rgba(110,231,249,0.04) 100%)', border: '1px solid rgba(110,231,249,0.45)', color: '#F4F1EA', boxShadow: 'var(--v-shadow-sm)' }
                  : { background: 'linear-gradient(160deg,rgba(255,255,255,0.04) 0%,#151a23 100%)', border: '1px solid rgba(255,255,255,0.08)', borderBottomColor: 'rgba(0,0,0,0.35)', color: '#A7AFBA', boxShadow: 'var(--v-shadow-sm)' }
                }
              >
                <span className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all"
                  style={tools.includes(o.v) ? { background: '#6EE7F9', border: '1px solid #6EE7F9' } : { border: '1px solid rgba(244,241,234,0.25)' }}>
                  {tools.includes(o.v) && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0E1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
                {TOOL_LOGO[o.v] && <img src={`https://logo.clearbit.com/${TOOL_LOGO[o.v]}`} alt="" width="14" height="14" className="w-3.5 h-3.5 rounded object-contain flex-shrink-0 opacity-70" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                {gl(o.l, lang)}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {PAIN_OPTIONS.map((o) => (
              <button key={o.v} onClick={() => setSession((s) => ({ ...s, pains: s.pains.includes(o.v) ? s.pains.filter((x) => x !== o.v) : [...s.pains, o.v] }))}
                className="w-full text-start px-4 py-3.5 rounded-xl text-sm transition-all flex items-center gap-3"
                style={pains.includes(o.v)
                  ? { background: 'linear-gradient(160deg,rgba(110,231,249,0.1) 0%,rgba(110,231,249,0.04) 100%)', border: '1px solid rgba(110,231,249,0.45)', color: '#F4F1EA', boxShadow: 'var(--v-shadow-sm)' }
                  : { background: 'linear-gradient(160deg,rgba(255,255,255,0.04) 0%,#151a23 100%)', border: '1px solid rgba(255,255,255,0.08)', borderBottomColor: 'rgba(0,0,0,0.35)', color: '#A7AFBA', boxShadow: 'var(--v-shadow-sm)' }
                }
              >
                <span className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all"
                  style={pains.includes(o.v) ? { background: '#6EE7F9', border: '1px solid #6EE7F9' } : { border: '1px solid rgba(244,241,234,0.25)' }}>
                  {pains.includes(o.v) && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0E1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
                {gl(o.l, lang)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => step > 0 && setSession((s) => ({...s, step:s.step-1}))} disabled={step === 0} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] disabled:opacity-30 font-mono transition-colors">{lang === 'he' ? '→' : '←'} {t.back}</button>
        <button
          onClick={() => setSession((s) => ({...s, step:s.step+1}))}
          disabled={step === 0 ? tools.length === 0 : pains.length === 0}
          className="font-semibold text-sm px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: 'linear-gradient(180deg,#7df0ff 0%,#6ee7f9 45%,#4dcfed 100%)', color: '#0E1117', boxShadow: '0 1px 0 0 rgba(255,255,255,0.22) inset,0 -1px 0 0 rgba(0,0,0,0.2) inset,0 4px 12px rgba(110,231,249,0.25)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {step === 1 ? t.seeResults : t.next} {lang === 'he' ? '←' : '→'}
        </button>
      </div>
    </div>
  );
}
