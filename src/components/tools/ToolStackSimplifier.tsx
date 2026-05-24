import { useState } from 'react';

type Lang = 'he' | 'en' | 'es' | 'ru';
type T = { back: string; next: string; seeResults: string; startOver: string; yourScore: string; topFindings: string; quickWins: string; nextActions: string; relatedTools: string; newsletterTitle: string; newsletterPlaceholder: string; newsletterCta: string; newsletterDisclaimer: string; lang: string };

function gl(o: Record<string, string>, l: string) { return o[l] ?? o['en'] ?? ''; }

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
  const [step, setStep] = useState(0);
  const [tools, setTools] = useState<string[]>([]);
  const [pains, setPains] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const isResult = step >= 2;

  function toggleTool(v: string) { setTools((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]); }
  function togglePain(v: string) { setPains((p) => p.includes(v) ? p.filter((x) => x !== v) : [...p, v]); }

  const advice = [...tools.filter((t) => ADVICE[t]), ...pains.filter((p) => ADVICE[p])]
    .map((k) => ADVICE[k]);

  const keep = tools.filter((t) => ['crm', 'automation'].includes(t));
  const review = tools.filter((t) => !['crm', 'automation'].includes(t));

  if (isResult) {
    const lbl = {
      keep: { he: 'שמור', en: 'Keep', es: 'Conservar', ru: 'Оставить' },
      review: { he: 'בדוק מחדש', en: 'Review', es: 'Revisar', ru: 'Пересмотреть' },
    };
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#151A23] border border-[rgba(199,255,74,0.2)] rounded-2xl p-5">
            <p className="font-mono text-xs text-[#C7FF4A] uppercase tracking-widest mb-3">{gl(lbl.keep, lang)}</p>
            {keep.length > 0 ? keep.map((t) => {
              const opt = TOOL_OPTIONS.find((o) => o.v === t);
              return <p key={t} className="text-sm text-[#F4F1EA]">{opt ? gl(opt.l, lang) : t}</p>;
            }) : <p className="text-xs text-[#A7AFBA]">—</p>}
          </div>
          <div className="bg-[#151A23] border border-[rgba(255,122,89,0.2)] rounded-2xl p-5">
            <p className="font-mono text-xs text-[#FF7A59] uppercase tracking-widest mb-3">{gl(lbl.review, lang)}</p>
            {review.length > 0 ? review.map((t) => {
              const opt = TOOL_OPTIONS.find((o) => o.v === t);
              return <p key={t} className="text-sm text-[#A7AFBA]">{opt ? gl(opt.l, lang) : t}</p>;
            }) : <p className="text-xs text-[#A7AFBA]">—</p>}
          </div>
        </div>

        {advice.length > 0 && (
          <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6">
            <p className="font-mono text-xs uppercase text-[#C7FF4A] tracking-widest mb-4">{t.quickWins}</p>
            <ul className="space-y-2">
              {advice.slice(0, 3).map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#F4F1EA]">
                  <span className="w-5 h-5 rounded-full bg-[#C7FF4A]/10 border border-[#C7FF4A]/30 flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-[10px] text-[#C7FF4A]">{i + 1}</span>
                  {gl(a, lang)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button onClick={() => { setStep(0); setTools([]); setPains([]); }} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] font-mono transition-colors">↺ {t.startOver}</button>
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-[#A7AFBA]"><span>{step + 1} / 2</span><span>{step * 50}%</span></div>
        <div className="h-1.5 rounded-full bg-[#1E2530] overflow-hidden"><div className="h-full rounded-full bg-[#6EE7F9] transition-all duration-300" style={{ width: `${step * 50}%` }} /></div>
      </div>

      {step === 0 ? (
        <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8">
          <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-2">
            {lang === 'he' ? 'אילו כלים אתה משתמש בהם?' : lang === 'ru' ? 'Какими инструментами вы пользуетесь?' : lang === 'es' ? '¿Qué herramientas usas?' : 'Which tools do you use?'}
          </h2>
          <p className="text-xs text-[#A7AFBA]/60 font-mono mb-5">{lang === 'he' ? 'בחר הכל שרלוונטי' : lang === 'ru' ? 'Выберите все подходящие' : lang === 'es' ? 'Selecciona todo lo que aplique' : 'Select all that apply'}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TOOL_OPTIONS.map((o) => (
              <button key={o.v} onClick={() => toggleTool(o.v)} className={`text-start px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${tools.includes(o.v) ? 'border-[#6EE7F9]/60 bg-[#6EE7F9]/8 text-[#F4F1EA]' : 'border-[rgba(244,241,234,0.14)] bg-[#1E2530] text-[#A7AFBA] hover:text-[#F4F1EA]'}`}>
                <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${tools.includes(o.v) ? 'bg-[#6EE7F9] border-[#6EE7F9]' : 'border-[rgba(244,241,234,0.3)]'}`}>
                  {tools.includes(o.v) && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0E1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
                {gl(o.l, lang)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8">
          <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-2">
            {lang === 'he' ? 'מה הכי מתסכל אותך?' : lang === 'ru' ? 'Что вас больше всего раздражает?' : lang === 'es' ? '¿Qué te frustra más?' : 'What frustrates you most?'}
          </h2>
          <p className="text-xs text-[#A7AFBA]/60 font-mono mb-5">{lang === 'he' ? 'בחר הכל שרלוונטי' : lang === 'ru' ? 'Выберите все подходящие' : lang === 'es' ? 'Selecciona todo lo que aplique' : 'Select all that apply'}</p>
          <div className="space-y-2">
            {PAIN_OPTIONS.map((o) => (
              <button key={o.v} onClick={() => togglePain(o.v)} className={`w-full text-start px-4 py-3.5 rounded-xl border text-sm transition-all flex items-center gap-3 ${pains.includes(o.v) ? 'border-[#6EE7F9]/60 bg-[#6EE7F9]/8 text-[#F4F1EA]' : 'border-[rgba(244,241,234,0.14)] bg-[#1E2530] text-[#A7AFBA] hover:text-[#F4F1EA]'}`}>
                <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${pains.includes(o.v) ? 'bg-[#6EE7F9] border-[#6EE7F9]' : 'border-[rgba(244,241,234,0.3)]'}`}>
                  {pains.includes(o.v) && <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0E1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </span>
                {gl(o.l, lang)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={() => step > 0 && setStep((s) => s - 1)} disabled={step === 0} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] disabled:opacity-30 font-mono transition-colors">← {t.back}</button>
        <button onClick={() => setStep((s) => s + 1)} disabled={step === 0 ? tools.length === 0 : pains.length === 0} className="bg-[#6EE7F9] text-[#0E1117] font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-[#6EE7F9]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          {step === 1 ? t.seeResults : t.next} →
        </button>
      </div>
    </div>
  );
}
