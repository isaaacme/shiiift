import type { TranslationKey } from './he';

const ru: Record<TranslationKey, string> = {
  // Nav
  'nav.tools': 'Инструменты',
  'nav.workshop': 'Мастер-класс',
  'nav.thinking': 'Мышление',
  'nav.caseStudies': 'Кейсы',
  'nav.start': 'Начать',

  // Hero
  'hero.headline': 'Внедрение технологий для бизнеса, которому нужен рычаг.',
  'hero.subheadline':
    'Я помогаю компаниям определить, где цифровые системы, автоматизация, ИИ и улучшенные сайты могут снизить трение, сэкономить время и создать измеримые операционные улучшения.',
  'hero.cta.primary': 'Аудит моего бизнеса',
  'hero.cta.secondary': 'Смотреть мастер-класс',
  'hero.cta.tertiary': 'Посмотреть, как я думаю',

  // Diagnostic Entry
  'diagnostic.title': 'Где ваш бизнес теряет время?',
  'diagnostic.subtitle': 'Выберите проблему, которая ближе всего к вашему бизнесу.',
  'diagnostic.card.website': 'Сайт не конвертирует',
  'diagnostic.card.website.desc': 'Посетители приходят, но не становятся клиентами.',
  'diagnostic.card.leads': 'Лиды в беспорядке',
  'diagnostic.card.leads.desc': 'Нет чёткой системы для захвата, отслеживания и закрытия сделок.',
  'diagnostic.card.manual': 'Слишком много ручной работы',
  'diagnostic.card.manual.desc': '12–20 часов в неделю можно восстановить.',
  'diagnostic.card.tools': 'Инструменты не связаны',
  'diagnostic.card.tools.desc': 'Системы, которые не общаются друг с другом.',
  'diagnostic.card.ai': 'ИИ кажется запутанным',
  'diagnostic.card.ai.desc': 'Не уверен, что реально полезно для вашего бизнеса.',
  'diagnostic.card.strategy': 'Нет чёткой цифровой стратегии',
  'diagnostic.card.strategy.desc': 'Нет ясного понимания, куда должны идти технологии.',

  // Tools Section
  'tools.section.title': 'Инструменты, которые можно использовать прямо сейчас',
  'tools.section.subtitle': 'Практическая диагностика с мгновенной ценностью. Без регистрации.',
  'tools.cta': 'Запустить инструмент',
  'tools.time': 'мин',

  'tools.businessAudit.title': 'Самоаудит бизнес-технологий',
  'tools.businessAudit.desc': 'Диагностика зрелости технологий вашего бизнеса на высоком уровне.',
  'tools.businessAudit.time': '4–5',
  'tools.businessAudit.output': 'Оценка зрелости + топ-3 узких мест',

  'tools.websiteAudit.title': 'Аудит использования сайта',
  'tools.websiteAudit.desc': 'Определите, работает ли ваш сайт как бизнес-система.',
  'tools.websiteAudit.time': '3–4',
  'tools.websiteAudit.output': 'Оценка системы + 3 немедленных улучшения',

  'tools.automationFinder.title': 'Поиск возможностей автоматизации',
  'tools.automationFinder.desc': 'Найдите повторяющуюся работу, которую стоит автоматизировать.',
  'tools.automationFinder.time': '3–4',
  'tools.automationFinder.output': 'Восстанавливаемые часы + рекомендуемая первая автоматизация',

  'tools.aiReadiness.title': 'Фильтр готовности к ИИ',
  'tools.aiReadiness.desc': 'Отделите полезный ИИ от шума.',
  'tools.aiReadiness.time': '3',
  'tools.aiReadiness.output': 'Хорошие и плохие сценарии использования ИИ для вашего бизнеса',

  'tools.toolStack.title': 'Упрощение стека инструментов',
  'tools.toolStack.desc': 'Сократите хаос инструментов. Найдите, что оставить, подключить, заменить или удалить.',
  'tools.toolStack.time': '3',
  'tools.toolStack.output': 'Оставить / Подключить / Заменить / Удалить',

  'tools.leadFlow.title': 'Карта потока лидов',
  'tools.leadFlow.desc': 'Составьте карту пути клиента и определите точки трения.',
  'tools.leadFlow.time': '4',
  'tools.leadFlow.output': 'Схема потока + слабые места + первое исправление',

  'tools.pricingCalculator.title': 'Калькулятор стоимости проекта',
  'tools.pricingCalculator.desc': 'Оцените бюджет внедрения и требования к ресурсам.',
  'tools.pricingCalculator.time': '3',
  'tools.pricingCalculator.output': 'Оценка бюджета + распределение ресурсов',

  'tools.proposalBuilder.title': 'Конструктор коммерческих предложений',
  'tools.proposalBuilder.desc': 'Создайте персонализированное техническое предложение, адаптированное к задачам вашего бизнеса.',
  'tools.proposalBuilder.time': '4',
  'tools.proposalBuilder.output': 'Индивидуальное загружаемое предложение по внедрению',

  // Workshop
  'workshop.label': 'Мастер-класс',
  'workshop.title': 'Как думать о технологиях в своём бизнесе',
  'workshop.desc':
    'Практическая 30-минутная стратегическая сессия, которая помогает владельцам бизнеса понять, где технологии могут помочь, что игнорировать и как выбрать первое улучшение, которое стоит внедрить.',
  'workshop.cta.primary': 'Смотреть 30-минутный мастер-класс',
  'workshop.cta.secondary': 'Получить контрольный список аудита',
  'workshop.topics.1': 'Почему большинство компаний начинают не с того инструмента',
  'workshop.topics.2': 'Как определить утечки времени',
  'workshop.topics.3': 'Когда автоматизация помогает — и когда ухудшает ситуацию',
  'workshop.topics.4': 'Где ИИ полезен, а где — шум',
  'workshop.topics.5': 'Как сайты превращаются в бизнес-системы',
  'workshop.topics.6': 'Как выбрать первый проект',

  // Case Studies
  'caseStudies.label': 'Кейсы',
  'caseStudies.title': 'Проблема → Вмешательство → Результат',
  'caseStudies.subtitle': 'Не портфолио. Запись операционных улучшений.',
  'caseStudies.cta': 'Смотреть все кейсы',
  'caseStudies.readMore': 'Читать далее',

  // Engagement Models
  'services.label': 'Форматы сотрудничества',
  'services.title': 'Как я работаю с вами',
  'services.subtitle': 'Не обычный список услуг. Структурированные форматы сотрудничества.',

  'services.audit.title': 'Технологический аудит',
  'services.audit.for': 'Для компаний, которым нужна ясность',
  'services.audit.desc': 'Обзор рабочего процесса, сайта, стека инструментов, выявление узких мест и приоритизированная дорожная карта внедрения.',
  'services.audit.output': 'Письменный отчёт + рекомендуемый первый проект',

  'services.sprint.title': 'Спринт внедрения',
  'services.sprint.for': 'Для компаний, которые знают, что нужно исправить',
  'services.sprint.desc': 'Автоматизация, внедрение сайта/системы, интеграция, дашборд, улучшение рабочего процесса.',
  'services.sprint.output': 'Работающая система + документация + передача',

  'services.partner.title': 'Стратегический технологический партнёр',
  'services.partner.for': 'Для постоянной поддержки',
  'services.partner.desc': 'Планирование, внедрение, оптимизация, эксперименты, дорожная карта автоматизации, оценка ИИ/инструментов.',
  'services.partner.output': 'Постоянное операционное улучшение',

  'services.whitelabel.title': 'Технический слой белой метки',
  'services.whitelabel.for': 'Для агентств',
  'services.whitelabel.desc': 'Сайты, headless-сборки, автоматизация, интеграции, техническое консультирование, поддержка внедрения.',
  'services.whitelabel.output': 'Надёжное техническое партнёрство',

  // About
  'nav.about': 'Обо мне',
  'about.label': 'Обо мне',
  'about.title': 'Я работаю там, где бизнес-проблемы встречаются с техническим исполнением.',
  'about.desc': 'Мой background — веб-дизайн и разработка, но работа расширилась до автоматизации, технической стратегии и ИИ. Я понимаю как деловой разговор, так и детали реализации.',
  'about.body':
    'Мой background — веб-дизайн и разработка, но работа расширилась до автоматизации, технической стратегии, рабочих процессов с ИИ, интеграций и цифровых систем, которые помогают бизнесу работать лучше. Я понимаю как деловой разговор, так и детали реализации.',
  'about.founder.name': 'Исаак Фельдман',
  'about.founder.title': 'Основатель Shiiift',
  'about.founder.bio': 'Я Исаак Фельдман, основатель Shiiift. Мой опыт включает дизайн, веб-разработку, цифровую стратегию и техническую реализацию. Я запустил Shiiift, чтобы помочь бизнесу избавиться от разрозненных инструментов, рутины и цифровых систем, которые создают больше сложностей, чем решают. Моя роль — понять, как работает ваш бизнес, найти утечки времени и лидов, а затем спроектировать и внедрить практичное решение.',

  // Final CTA
  'finalCta.title': 'Найдите свою первую технологическую победу',
  'finalCta.desc': 'Начните с аудита. Получите ясность о том, что изменить первым.',
  'finalCta.cta': 'Начать аудит',

  // Thinking
  'thinking.label': 'Мышление',
  'thinking.title': 'Статьи и заметки',
  'thinking.subtitle': 'Не блог. Библиотека практического анализа.',
  'thinking.readMore': 'Читать далее',

  // Start / Contact
  'start.title': 'Начнём',
  'start.desc': 'Расскажите о своём бизнесе, и мы вместе найдём, что изменить первым.',
  'start.subtitle': 'Расскажите о своём бизнесе, и мы вместе найдём, что изменить первым.',
  'start.form.name': 'Имя',
  'start.form.namePlaceholder': 'Ваше имя',
  'start.form.company': 'Компания',
  'start.form.companyPlaceholder': 'Название бизнеса (необязательно)',
  'start.form.businessType': 'Тип бизнеса',
  'start.form.businessTypePlaceholder': 'например: Клиника, Агентство, Ритейл',
  'start.form.website': 'URL сайта',
  'start.form.websitePlaceholder': 'https://yoursite.com',
  'start.form.bottleneck': 'Ваше главное узкое место',
  'start.form.bottleneckPlaceholder': 'Что замедляет работу?',
  'start.form.challenge': 'Ваш главный вызов',
  'start.form.challengePlaceholder': 'Выберите...',
  'start.form.message': 'Сообщение',
  'start.form.messagePlaceholder': 'Расскажите о своём бизнесе...',
  'start.form.email': 'Email',
  'start.form.emailPlaceholder': 'you@example.com',
  'start.form.submit': 'Отправить',
  'start.form.disclaimer': 'Без спама. Ответ в течение 48 часов.',
  'start.form.success': 'Спасибо. Я скоро свяжусь с вами.',

  // Footer
  'footer.tagline': 'Технологии, которые снижают трение, а не добавляют сложность.',
  'footer.rights': 'Все права защищены',

  // Tool shared UI
  'tool.back': 'Назад',
  'tool.next': 'Далее',
  'tool.seeResults': 'Посмотреть результаты',
  'tool.startOver': 'Начать заново',
  'tool.yourScore': 'Ваш результат',
  'tool.topFindings': 'Главные выводы',
  'tool.quickWins': 'Быстрые победы',
  'tool.nextActions': 'Рекомендуемые следующие шаги',
  'tool.relatedTools': 'Связанные инструменты',
  'tool.newsletter.title': 'Получайте уведомления о новых инструментах',
  'tool.newsletter.placeholder': 'you@example.com',
  'tool.newsletter.cta': 'Уведомить меня',
  'tool.newsletter.disclaimer': 'Без спама. Без воронки продаж. Иногда — инструменты и заметки.',

  // OS Console
  'console.searchPlaceholder': 'Поиск инструментов (например: автоматизация, CRM)...',
  'console.backToDashboard': 'Назад в панель',
  'console.runTool': 'Запустить',
  'console.outputLabel': 'Результат',
  'console.categories.all': 'Все инструменты',
  'console.categories.leads': 'Лиды и конверсия',
  'console.categories.ops': 'Автоматизация и процессы',
  'console.categories.ai': 'ИИ и технологии',
  'console.categories.strategy': 'Стратегия',
  'console.categories.finance': 'Бюджет и цены',
};

export default ru;
