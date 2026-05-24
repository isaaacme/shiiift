import { useState, useEffect } from 'react';
import ToolResult from './ToolResult';
import { useToolSession, trackEvent } from './useToolSession';

type Lang = 'he' | 'en' | 'es' | 'ru';
type T = { back: string; next: string; seeResults: string; startOver: string; yourScore: string; topFindings: string; quickWins: string; nextActions: string; relatedTools: string; newsletterTitle: string; newsletterPlaceholder: string; newsletterCta: string; newsletterDisclaimer: string; lang: string };

function gl(o: Record<string, string>, l: string) { return o[l] ?? o['en'] ?? ''; }

const QS = [
  {
    id: 'support',
    q: { he: 'כמה פניות תמיכה לקוחות אתה מקבל בשבוע?', en: 'How many customer support requests do you get weekly?', es: '¿Cuántas consultas de soporte recibes semanalmente?', ru: 'Сколько запросов поддержки вы получаете в неделю?' },
    opts: [
      { v: 'few', l: { he: 'פחות מ-10', en: 'Fewer than 10', es: 'Menos de 10', ru: 'Менее 10' } },
      { v: 'medium', l: { he: '10–50', en: '10–50', es: '10–50', ru: '10–50' } },
      { v: 'many', l: { he: 'יותר מ-50', en: 'More than 50', es: 'Más de 50', ru: 'Более 50' } },
    ],
  },
  {
    id: 'content',
    q: { he: 'האם אתה מייצר תוכן בקביעות?', en: 'Do you produce content regularly?', es: '¿Produces contenido regularmente?', ru: 'Вы регулярно создаёте контент?' },
    opts: [
      { v: 'no', l: { he: 'לא, כמעט בכלל לא', en: 'No, rarely', es: 'No, casi nunca', ru: 'Нет, почти никогда' } },
      { v: 'sometimes', l: { he: 'לפעמים, לא בעקביות', en: 'Sometimes, inconsistently', es: 'A veces, inconsistentemente', ru: 'Иногда, непостоянно' } },
      { v: 'yes', l: { he: 'כן, לפחות פעם בשבוע', en: 'Yes, at least weekly', es: 'Sí, al menos semanalmente', ru: 'Да, как минимум еженедельно' } },
    ],
  },
  {
    id: 'documents',
    q: { he: 'האם יש לך מסמכים / נהלים / FAQ שחוזרים על עצמם?', en: 'Do you have repetitive documents / procedures / FAQs?', es: '¿Tienes documentos / procedimientos / FAQs repetitivos?', ru: 'Есть ли у вас повторяющиеся документы / процедуры / FAQ?' },
    opts: [
      { v: 'no', l: { he: 'לא ממש', en: 'Not really', es: 'No mucho', ru: 'Не особо' } },
      { v: 'some', l: { he: 'כן, כמה', en: 'Yes, some', es: 'Sí, algunos', ru: 'Да, несколько' } },
      { v: 'many', l: { he: 'הרבה', en: 'Many', es: 'Muchos', ru: 'Много' } },
    ],
  },
  {
    id: 'decisions',
    q: { he: 'האם יש לך החלטות חוזרות עם קריטריונים ברורים?', en: 'Do you have repetitive decisions with clear criteria?', es: '¿Tienes decisiones repetitivas con criterios claros?', ru: 'Есть ли у вас повторяющиеся решения с чёткими критериями?' },
    opts: [
      { v: 'no', l: { he: 'לא', en: 'No', es: 'No', ru: 'Нет' } },
      { v: 'some', l: { he: 'כמה', en: 'A few', es: 'Algunas', ru: 'Несколько' } },
      { v: 'yes', l: { he: 'כן, הרבה', en: 'Yes, many', es: 'Sí, muchas', ru: 'Да, много' } },
    ],
  },
];

const GOOD: Record<string, Record<string, string>> = {
  support_many: { he: 'צ\'אטבוט AI לשאלות נפוצות ותמיכה ברמה 1', en: 'AI chatbot for FAQs and tier-1 support', es: 'Chatbot de IA para FAQs y soporte básico', ru: 'AI чат-бот для FAQ и первичной поддержки' },
  content_yes: { he: 'AI לטיוטות תוכן ראשוניות ועריכה', en: 'AI for first-draft content and editing', es: 'IA para borradores de contenido y edición', ru: 'ИИ для черновиков контента и редактирования' },
  documents_many: { he: 'AI לסיכום מסמכים וחיפוש ידע', en: 'AI for document summarisation and knowledge search', es: 'IA para resumen de documentos y búsqueda de conocimiento', ru: 'ИИ для резюмирования документов и поиска знаний' },
  decisions_yes: { he: 'AI לסינון ולוגיקת ניתוב ראשוני', en: 'AI for screening and initial routing logic', es: 'IA para filtrado y lógica de enrutamiento inicial', ru: 'ИИ для скрининга и первичной маршрутизации' },
};

const BAD: Record<string, string> = {
  he: 'AI אסטרטגי, קשרי לקוחות מורכבים, החלטות ניואנסיות עסקיות — אלה נשארים אנושיים',
  en: 'Strategic thinking, complex client relationships, nuanced business decisions — these stay human',
  es: 'Pensamiento estratégico, relaciones complejas con clientes, decisiones empresariales matizadas — esto sigue siendo humano',
  ru: 'Стратегическое мышление, сложные клиентские отношения, нюансированные бизнес-решения — это остаётся за людьми',
};

export default function AIReadiness({ t }: { t: T }) {
  const lang = (t.lang || 'en') as Lang;
  const [session, setSession, clearSession] = useToolSession('ai-readiness', { step: 0, answers: {} as Record<string, string>, selected: '' });
  const { step, answers, selected } = session;

  const isResult = step >= QS.length;
  const cq = QS[step];

  const goodUses = Object.entries(GOOD)
    .filter(([k]) => { const [field, val] = k.split('_'); return answers[field] === val; })
    .map(([, v]) => v);

  const keepHumanLabel = { he: 'לא לאוטומציה', en: 'Keep human', es: 'No automatizar', ru: 'Не для автоматизации' };
  const noUsesLabel = { he: 'לא זוהו מקרי שימוש ברורים לAI כרגע.', en: 'No clear AI use cases identified yet.', es: 'No se identificaron casos de uso de IA claros por ahora.', ru: 'Явных кейсов для ИИ пока не выявлено.' };

  const nextActions = [
    goodUses.length > 0 && { he: 'בחר מקרה שימוש אחד ל-AI מהרשימה ובנה גרסת PoC בשבוע', en: 'Pick one AI use case from the list and build a PoC this week', es: 'Elige un caso de uso de IA y crea un PoC esta semana', ru: 'Выберите один AI-кейс из списка и создайте PoC на этой неделе' },
    answers.support === 'many' && { he: 'הגדר צ\'אטבוט AI עם מסד ידע מ-FAQ קיים', en: 'Set up an AI chatbot trained on your existing FAQ', es: 'Configura un chatbot de IA entrenado con tu FAQ existente', ru: 'Настройте AI-чатбот на основе существующего FAQ' },
    { he: 'הגדר בדיקת סף ל-AI: האם זה חוזר, מבוסס כללים, בנפח גבוה?', en: 'Apply the AI threshold test: is it repetitive, rules-based, high-volume?', es: 'Aplica el test de umbral de IA: ¿es repetitivo, basado en reglas, alto volumen?', ru: 'Применяйте AI-порог: повторяющееся, основанное на правилах, высокообъёмное?' },
  ].filter(Boolean).slice(0, 3).map((a: any) => gl(a, lang));

  useEffect(() => {
    if (step === 0 && Object.keys(answers).length === 0) trackEvent('tool_started', { tool: 'ai-readiness', lang });
  }, []);
  useEffect(() => {
    if (isResult) trackEvent('tool_completed', { tool: 'ai-readiness', lang, uses: String(goodUses.length) });
  }, [isResult]);

  if (isResult) {
    return (
      <ToolResult
        lang={lang}
        toolId="ai-readiness"
        t={t}
        answers={answers}
        findings={goodUses.length > 0 ? goodUses.map((u) => `✓ ${gl(u, lang)}`) : [gl(noUsesLabel, lang)]}
        nextActions={nextActions}
        onReset={clearSession}
        scoreBlock={
          <div>
            <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-3">{t.topFindings}</p>
            <div className="border-t border-[rgba(244,241,234,0.08)] mt-4 pt-4">
              <p className="font-mono text-xs text-[#FF7A59] mb-2 uppercase tracking-widest">{gl(keepHumanLabel, lang)}</p>
              <p className="text-sm text-[#A7AFBA]">{BAD[lang] ?? BAD['en']}</p>
            </div>
          </div>
        }
      />
    );
  }

  const progress = Math.round((step / QS.length) * 100);
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-[#A7AFBA]"><span>{step + 1} / {QS.length}</span><span>{progress}%</span></div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg,#0c1018,#141a24)', boxShadow: '0 1px 3px rgba(0,0,0,0.5) inset' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#aee038,#c7ff4a)', boxShadow: '0 0 6px rgba(199,255,74,0.35)' }} />
        </div>
      </div>
      <div style={{ background: 'linear-gradient(160deg,rgba(255,255,255,0.055) 0%,#151A23 30%,#111620 100%)', border: '1px solid rgba(255,255,255,0.1)', borderBottomColor: 'rgba(0,0,0,0.4)', boxShadow: 'var(--v-shadow-md)', borderRadius: '1rem', padding: '1.5rem 2rem' }}>
        <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-6">{gl(cq.q, lang)}</h2>
        <div className="space-y-2">
          {cq.opts.map((o) => (
            <button key={o.v} onClick={() => setSession((s) => ({ ...s, selected: o.v }))}
              className="w-full text-start px-4 py-3.5 rounded-xl text-sm transition-all"
              style={selected === o.v
                ? { background: 'linear-gradient(160deg,rgba(199,255,74,0.1) 0%,rgba(199,255,74,0.04) 100%)', border: '1px solid rgba(199,255,74,0.45)', color: '#F4F1EA', boxShadow: 'var(--v-shadow-sm)' }
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
          onClick={() => { if (step === 0) return; const pq = QS[step-1]; setSession((s) => ({...s, step:s.step-1, selected:s.answers[pq.id]||''})); }}
          disabled={step === 0} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] disabled:opacity-30 font-mono transition-colors">{lang === 'he' ? '→' : '←'} {t.back}
        </button>
        <button
          onClick={() => { if (!selected) return; setSession((s) => ({...s, answers:{...s.answers,[cq.id]:selected}, selected:'', step:s.step+1})); }}
          disabled={!selected}
          className="font-semibold text-sm px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{ background: 'linear-gradient(180deg,#d6ff5e 0%,#c7ff4a 45%,#aee038 100%)', color: '#0E1117', boxShadow: 'var(--v-shadow-accent)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {step === QS.length - 1 ? t.seeResults : t.next} {lang === 'he' ? '←' : '→'}
        </button>
      </div>
    </div>
  );
}
