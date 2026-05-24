import { useState } from 'react';

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
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState('');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const isResult = step >= QS.length;
  const cq = QS[step];

  function next() {
    if (!selected) return;
    setAnswers((p) => ({ ...p, [cq.id]: selected }));
    setSelected('');
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) return;
    const pq = QS[step - 1];
    setSelected(answers[pq.id] || '');
    setStep((s) => s - 1);
  }

  const goodUses = Object.entries(GOOD)
    .filter(([k]) => {
      const [field, val] = k.split('_');
      return answers[field] === val;
    })
    .map(([, v]) => v);

  if (isResult) {
    return (
      <div className="space-y-6">
        <div className="bg-[#151A23] border border-[rgba(244,241,234,0.14)] rounded-2xl p-6 sm:p-8">
          <p className="font-mono text-xs tracking-widest uppercase text-[#C7FF4A] mb-4">{t.topFindings}</p>
          {goodUses.length > 0 ? (
            <ul className="space-y-2 mb-5">
              {goodUses.map((u, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#F4F1EA]">
                  <span className="text-[#C7FF4A] mt-0.5 flex-shrink-0">✓</span>
                  {gl(u, lang)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#A7AFBA] mb-5">
              {lang === 'he' ? 'לא זוהו מקרי שימוש ברורים לAI כרגע.' : lang === 'ru' ? 'Явных кейсов для ИИ пока не выявлено.' : lang === 'es' ? 'No se identificaron casos de uso de IA claros por ahora.' : 'No clear AI use cases identified yet.'}
            </p>
          )}
          <div className="border-t border-[rgba(244,241,234,0.14)] pt-4">
            <p className="font-mono text-xs text-[#FF7A59] mb-2 uppercase tracking-widest">
              {lang === 'he' ? 'לא לאוטומציה' : lang === 'ru' ? 'Не для автоматизации' : lang === 'es' ? 'No automatizar' : 'Keep human'}
            </p>
            <p className="text-sm text-[#A7AFBA]">{BAD[lang] ?? BAD['en']}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button onClick={() => { setStep(0); setAnswers({}); setSelected(''); }} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] font-mono transition-colors">↺ {t.startOver}</button>
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
        <h2 className="font-['Inter_Tight',system-ui,sans-serif] font-semibold text-xl text-[#F4F1EA] mb-6">{gl(cq.q, lang)}</h2>
        <div className="space-y-2">
          {cq.opts.map((o) => (
            <button key={o.v} onClick={() => setSelected(o.v)} className={`w-full text-start px-4 py-3.5 rounded-xl border text-sm transition-all ${selected === o.v ? 'border-[#C7FF4A]/60 bg-[#C7FF4A]/8 text-[#F4F1EA]' : 'border-[rgba(244,241,234,0.14)] bg-[#1E2530] text-[#A7AFBA] hover:text-[#F4F1EA] hover:border-[rgba(244,241,234,0.25)]'}`}>
              {gl(o.l, lang)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button onClick={back} disabled={step === 0} className="text-sm text-[#A7AFBA] hover:text-[#F4F1EA] disabled:opacity-30 font-mono transition-colors">← {t.back}</button>
        <button onClick={next} disabled={!selected} className="bg-[#C7FF4A] text-[#0E1117] font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-[#C7FF4A]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          {step === QS.length - 1 ? t.seeResults : t.next} →
        </button>
      </div>
    </div>
  );
}
