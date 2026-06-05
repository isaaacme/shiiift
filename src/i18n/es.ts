import type { TranslationKey } from './he';

const es: Record<TranslationKey, string> = {
  // Nav
  'nav.tools': 'Herramientas',
  'nav.workshop': 'Taller',
  'nav.thinking': 'Pensamiento',
  'nav.caseStudies': 'Casos de Estudio',
  'nav.start': 'Empezar',

  // Hero
  'hero.headline': 'Implementación tecnológica para empresas que necesitan apalancamiento.',
  'hero.subheadline':
    'Ayudo a las empresas a identificar dónde los sistemas digitales, la automatización, la IA y mejores sitios web pueden reducir la fricción, ahorrar tiempo y crear mejoras operativas medibles.',
  'hero.cta.primary': 'Auditar mi empresa',
  'hero.cta.secondary': 'Ver el taller',
  'hero.cta.tertiary': 'Ver cómo pienso',
  'hero.new.title': 'Construimos los sistemas que hacen tu negocio más fácil de operar.',
  'hero.new.desc': 'Sin jerga técnica ni soluciones sobre-diseñadas. Shiiift es un socio estratégico de implementación fundado por Isaac Feldman. Conectamos tus herramientas, automatizamos tareas repetitivas, optimizamos sitios web e integramos IA donde realmente te ahorra horas de trabajo. Elige una herramienta a continuación para diagnosticar tus cuellos de botella y ver cómo trabajamos.',
  'hero.new.cta.console': 'Ejecutar un diagnóstico',
  'hero.new.cta.start': 'Programar implementación',

  // Diagnostic Entry
  'diagnostic.title': '¿Dónde pierde tiempo tu empresa?',
  'diagnostic.subtitle': 'Elige el problema que más se acerca a tu empresa.',
  'diagnostic.card.website': 'El sitio web no convierte',
  'diagnostic.card.website.desc': 'Los visitantes llegan pero no se convierten en clientes.',
  'diagnostic.card.leads': 'Los leads son un caos',
  'diagnostic.card.leads.desc': 'Sin sistema claro para captar, hacer seguimiento y cerrar.',
  'diagnostic.card.manual': 'Demasiado trabajo manual',
  'diagnostic.card.manual.desc': '12–20 horas semanales potencialmente recuperables.',
  'diagnostic.card.tools': 'Herramientas desconectadas',
  'diagnostic.card.tools.desc': 'Sistemas que no se comunican entre sí.',
  'diagnostic.card.ai': 'La IA es confusa',
  'diagnostic.card.ai.desc': 'No estoy seguro de qué es realmente útil para mi negocio.',
  'diagnostic.card.strategy': 'Sin estrategia digital clara',
  'diagnostic.card.strategy.desc': 'Sin una imagen clara de hacia dónde debe ir la tecnología.',

  // Tools Section
  'tools.section.title': 'Herramientas que puedes usar ahora',
  'tools.section.subtitle': 'Diagnósticos prácticos que entregan valor inmediato. Sin registro.',
  'tools.cta': 'Usar la herramienta',
  'tools.time': 'min',

  'tools.businessAudit.title': 'Autoauditoría de tecnología empresarial',
  'tools.businessAudit.desc': 'Diagnóstico de alto nivel para la madurez tecnológica de tu empresa.',
  'tools.businessAudit.time': '4–5',
  'tools.businessAudit.output': 'Puntuación de madurez + los 3 principales cuellos de botella',

  'tools.websiteAudit.title': 'Auditoría de apalancamiento del sitio web',
  'tools.websiteAudit.desc': 'Determina si tu sitio web funciona como un sistema empresarial.',
  'tools.websiteAudit.time': '3–4',
  'tools.websiteAudit.output': 'Puntuación del sistema + 3 mejoras inmediatas',

  'tools.automationFinder.title': 'Buscador de oportunidades de automatización',
  'tools.automationFinder.desc': 'Encuentra trabajo repetitivo que vale la pena automatizar.',
  'tools.automationFinder.time': '3–4',
  'tools.automationFinder.output': 'Horas recuperables + primera automatización recomendada',

  'tools.aiReadiness.title': 'Filtro de preparación para IA',
  'tools.aiReadiness.desc': 'Separa la IA útil del ruido.',
  'tools.aiReadiness.time': '3',
  'tools.aiReadiness.output': 'Casos de uso buenos vs malos de IA para tu negocio',

  'tools.toolStack.title': 'Simplificador de stack de herramientas',
  'tools.toolStack.desc': 'Reduce el caos de herramientas. Descubre qué conservar, conectar, reemplazar o eliminar.',
  'tools.toolStack.time': '3',
  'tools.toolStack.output': 'Conservar / Conectar / Reemplazar / Eliminar',

  'tools.leadFlow.title': 'Mapeador de flujo de leads',
  'tools.leadFlow.desc': 'Mapea el recorrido del cliente e identifica la fricción.',
  'tools.leadFlow.time': '4',
  'tools.leadFlow.output': 'Diagrama de flujo + puntos débiles + primera corrección',

  'tools.pricingCalculator.title': 'Calculadora de presupuesto de proyecto',
  'tools.pricingCalculator.desc': 'Estima el presupuesto de implementación y los requerimientos de recursos.',
  'tools.pricingCalculator.time': '3',
  'tools.pricingCalculator.output': 'Estimación de presupuesto + asignación de recursos',

  'tools.proposalBuilder.title': 'Generador de propuestas',
  'tools.proposalBuilder.desc': 'Genera una propuesta técnica personalizada adaptada a los desafíos de tu negocio.',
  'tools.proposalBuilder.time': '4',
  'tools.proposalBuilder.output': 'Propuesta de implementación descargable personalizada',

  // Workshop
  'workshop.label': 'Taller',
  'workshop.title': 'Cómo pensar sobre la tecnología en tu empresa',
  'workshop.desc':
    'Una sesión práctica de pensamiento estratégico de 30 minutos que ayuda a los dueños de negocios a entender dónde la tecnología puede ayudar, qué ignorar y cómo elegir la primera mejora que vale la pena implementar.',
  'workshop.cta.primary': 'Ver el taller de 30 minutos',
  'workshop.cta.secondary': 'Obtener la lista de verificación',
  'workshop.topics.1': 'Por qué la mayoría de las empresas empiezan con la herramienta equivocada',
  'workshop.topics.2': 'Cómo identificar las fugas de tiempo',
  'workshop.topics.3': 'Cuándo la automatización ayuda — y cuándo empeora las cosas',
  'workshop.topics.4': 'Dónde la IA es útil y dónde es ruido',
  'workshop.topics.5': 'Cómo los sitios web se están convirtiendo en sistemas empresariales',
  'workshop.topics.6': 'Cómo elegir el primer proyecto',

  // Case Studies
  'caseStudies.label': 'Casos de Estudio',
  'caseStudies.title': 'Problema → Intervención → Resultado',
  'caseStudies.subtitle': 'No es un portafolio. Es un registro de mejoras operativas.',
  'caseStudies.cta': 'Ver todos los casos de estudio',
  'caseStudies.readMore': 'Leer más',

  // Engagement Models
  'services.label': 'Modelos de Colaboración',
  'services.title': 'Cómo trabajo contigo',
  'services.subtitle': 'No es una lista genérica de servicios. Son modelos de colaboración estructurados.',

  'services.audit.title': 'Auditoría tecnológica',
  'services.audit.for': 'Para empresas que necesitan claridad',
  'services.audit.desc': 'Revisión de flujo de trabajo, sitio web, stack de herramientas, identificación de cuellos de botella y hoja de ruta de implementación priorizada.',
  'services.audit.output': 'Informe escrito + primer proyecto recomendado',

  'services.sprint.title': 'Sprint de implementación',
  'services.sprint.for': 'Para empresas que saben qué necesita arreglarse',
  'services.sprint.desc': 'Automatización, implementación de sitio web/sistema, integración, dashboard, mejora de flujo de trabajo.',
  'services.sprint.output': 'Sistema funcionando + documentación + entrega',

  'services.partner.title': 'Socio tecnológico estratégico',
  'services.partner.for': 'Para soporte continuo',
  'services.partner.desc': 'Planificación, implementación, optimización, experimentos, hoja de ruta de automatización, evaluación de IA/herramientas.',
  'services.partner.output': 'Mejora operativa continua',

  'services.whitelabel.title': 'Capa técnica de marca blanca',
  'services.whitelabel.for': 'Para agencias',
  'services.whitelabel.desc': 'Sitios web, builds headless, automatización, integraciones, consultoría técnica, soporte de implementación.',
  'services.whitelabel.output': 'Asociación técnica confiable',

  // About
  'nav.about': 'Acerca de',
  'about.label': 'Acerca de',
  'about.title': 'Trabajo donde los problemas empresariales se encuentran con la ejecución técnica.',
  'about.desc': 'Mi formación es en diseño y desarrollo web, pero el trabajo se ha expandido hacia la automatización, la estrategia técnica y la IA. Entiendo tanto la conversación empresarial como los detalles de implementación.',
  'about.body':
    'Mi formación es en diseño y desarrollo web, pero el trabajo se ha expandido hacia la automatización, la estrategia técnica, los flujos de trabajo con IA, las integraciones y los sistemas digitales que ayudan a las empresas a operar mejor. Entiendo tanto la conversación empresarial como los detalles de implementación.',
  'about.founder.name': 'Isaac Feldman',
  'about.founder.title': 'Fundador de Shiiift',
  'about.founder.bio': 'Soy Isaac Feldman, fundador de Shiiift. Mi formación es en diseño, desarrollo web, estrategia digital e implementación técnica. Comencé Shiiift para ayudar a las empresas a ir más allá de las herramientas desconectadas, el trabajo manual repetitivo y los sistemas digitales que crean más fricción de la que resuelven. Mi función es comprender cómo funciona realmente un negocio, identificar dónde se pierde tiempo, prospectos y rentabilidad, y luego diseñar y construir una solución práctica en consecuencia.',

  // Final CTA
  'finalCta.title': 'Encuentra tu primera victoria tecnológica',
  'finalCta.desc': 'Empieza con una auditoría. Obtén claridad sobre qué cambiar primero.',
  'finalCta.cta': 'Iniciar la auditoría',

  // Thinking
  'thinking.label': 'Pensamiento',
  'thinking.title': 'Artículos y notas de pensamiento',
  'thinking.subtitle': 'No es un blog. Es una biblioteca de análisis práctico.',
  'thinking.readMore': 'Leer más',

  // Start / Contact
  'start.title': 'Empecemos',
  'start.desc': 'Cuéntame sobre tu empresa y encontraremos juntos qué cambiar primero.',
  'start.subtitle': 'Cuéntame sobre tu empresa y encontraremos juntos qué cambiar primero.',
  'start.form.name': 'Nombre',
  'start.form.namePlaceholder': 'Tu nombre',
  'start.form.company': 'Empresa',
  'start.form.companyPlaceholder': 'Nombre del negocio (opcional)',
  'start.form.businessType': 'Tipo de empresa',
  'start.form.businessTypePlaceholder': 'ej. Clínica, Agencia, Minorista',
  'start.form.website': 'URL del sitio web',
  'start.form.websitePlaceholder': 'https://yoursite.com',
  'start.form.bottleneck': 'Tu mayor cuello de botella',
  'start.form.bottleneckPlaceholder': '¿Qué está frenando las cosas?',
  'start.form.challenge': 'Tu mayor desafío',
  'start.form.challengePlaceholder': 'Elige...',
  'start.form.message': 'Mensaje',
  'start.form.messagePlaceholder': 'Cuéntame sobre tu negocio...',
  'start.form.email': 'Email',
  'start.form.emailPlaceholder': 'you@example.com',
  'start.form.submit': 'Enviar',
  'start.form.disclaimer': 'Sin spam. Respuesta en 48 horas.',
  'start.form.success': 'Gracias. Me pondré en contacto pronto.',

  // Footer
  'footer.tagline': 'Tecnología que reduce la fricción, no añade complejidad.',
  'footer.rights': 'Todos los derechos reservados',

  // Tool shared UI
  'tool.back': 'Atrás',
  'tool.next': 'Siguiente',
  'tool.seeResults': 'Ver resultados',
  'tool.startOver': 'Empezar de nuevo',
  'tool.yourScore': 'Tu puntuación',
  'tool.topFindings': 'Principales hallazgos',
  'tool.quickWins': 'Victorias rápidas',
  'tool.nextActions': 'Próximas acciones recomendadas',
  'tool.relatedTools': 'Herramientas relacionadas',
  'tool.newsletter.title': 'Recibe notificaciones de nuevas herramientas',
  'tool.newsletter.placeholder': 'you@example.com',
  'tool.newsletter.cta': 'Notificarme',
  'tool.newsletter.disclaimer': 'Sin spam. Sin embudo de ventas. Herramientas y notas ocasionales.',

  // OS Console
  'console.searchPlaceholder': 'Buscar herramientas (ej. automatización, CRM)...',
  'console.backToDashboard': 'Volver al panel',
  'console.runTool': 'Ejecutar',
  'console.outputLabel': 'Resultado',
  'console.categories.all': 'Todas las herramientas',
  'console.categories.leads': 'Leads y Conversión',
  'console.categories.ops': 'Automatización y Ops',
  'console.categories.ai': 'IA y Tecnología',
  'console.categories.strategy': 'Estrategia',
  'console.categories.finance': 'Presupuesto y Precios',
};

export default es;
