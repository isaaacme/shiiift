import type { TranslationKey } from './he';

const en: Record<TranslationKey, string> = {
  // Nav
  'nav.tools': 'Tools',
  'nav.workshop': 'Workshop',
  'nav.thinking': 'Thinking',
  'nav.caseStudies': 'Case Studies',
  'nav.start': 'Get started',

  // Hero
  'hero.headline': 'Spend less time on repetitive work.',
  'hero.subheadline': "Pick a tool below to find what's slowing you down — and get a useful answer in minutes.",
  'hero.cta.primary': 'Find what\'s slowing you down',
  'hero.cta.secondary': 'Talk to Isaac',
  'hero.cta.tertiary': 'Read the thinking',
  'hero.new.title': 'Spend less time on repetitive work.',
  'hero.new.desc': 'Pick a tool below. Answer a few questions. Get a useful answer in minutes — no signup, no sales call.',
  'hero.new.cta.console': 'Choose a tool',
  'hero.new.cta.start': 'Talk to Isaac',

  // Diagnostic Entry
  'diagnostic.title': "What's taking up your time?",
  'diagnostic.subtitle': 'Choose the one that feels most familiar.',
  'diagnostic.card.website': "My website isn't bringing in leads",
  'diagnostic.card.website.desc': "People visit but don't get in touch.",
  'diagnostic.card.leads': "I'm losing track of leads",
  'diagnostic.card.leads.desc': 'No clear system for following up and closing.',
  'diagnostic.card.manual': "I'm doing too much manually",
  'diagnostic.card.manual.desc': 'Work that could probably be automated.',
  'diagnostic.card.tools': "My tools don't work together",
  'diagnostic.card.tools.desc': "Apps that don't talk to each other.",
  'diagnostic.card.ai': "I don't know where AI fits",
  'diagnostic.card.ai.desc': "Not sure what's actually useful for my business.",
  'diagnostic.card.strategy': "I don't have a clear plan",
  'diagnostic.card.strategy.desc': 'No picture of what to fix or where to start.',

  // Tools Section
  'tools.section.title': 'Pick a tool. Get an answer.',
  'tools.section.subtitle': 'Free. No signup. Takes 3–5 minutes.',
  'tools.cta': 'Start',
  'tools.time': 'min',

  'tools.businessAudit.title': "Find what's slowing you down",
  'tools.businessAudit.desc': "Answer a few questions about how you work. Get a clear picture of what's costing you time.",
  'tools.businessAudit.time': '4–5',
  'tools.businessAudit.output': 'Score + top 3 bottlenecks',

  'tools.websiteAudit.title': "See why your website isn't converting",
  'tools.websiteAudit.desc': 'Find out if your site is working for you — or just sitting there.',
  'tools.websiteAudit.time': '3–4',
  'tools.websiteAudit.output': 'Score + 3 quick improvements',

  'tools.automationFinder.title': 'Find tasks you can stop doing manually',
  'tools.automationFinder.desc': 'Tell me what you do every week. Find out what can be automated.',
  'tools.automationFinder.time': '3–4',
  'tools.automationFinder.output': 'Hours saved + first automation to build',

  'tools.aiReadiness.title': 'Find where AI can actually help you',
  'tools.aiReadiness.desc': 'Cut through the noise. Find the AI use cases that fit your work.',
  'tools.aiReadiness.time': '3',
  'tools.aiReadiness.output': "Where AI helps vs. where it doesn't",

  'tools.toolStack.title': "Simplify the tools you're paying for",
  'tools.toolStack.desc': 'Too many apps. Find what to keep, connect, replace, or cut.',
  'tools.toolStack.time': '3',
  'tools.toolStack.output': 'Keep / Connect / Replace / Cut',

  'tools.leadFlow.title': 'Fix where leads are falling through the cracks',
  'tools.leadFlow.desc': 'Map your lead process and find where people are dropping off.',
  'tools.leadFlow.time': '4',
  'tools.leadFlow.output': 'Flow map + weak spot + first fix',

  'tools.pricingCalculator.title': 'Estimate what your project will cost',
  'tools.pricingCalculator.desc': 'Get a rough budget range for your implementation project.',
  'tools.pricingCalculator.time': '3',
  'tools.pricingCalculator.output': "Budget range + what's included",

  'tools.proposalBuilder.title': 'Build a proposal for your project',
  'tools.proposalBuilder.desc': 'Answer a few questions. Get a ready-to-share project proposal.',
  'tools.proposalBuilder.time': '4',
  'tools.proposalBuilder.output': 'Downloadable project proposal',

  // Workshop
  'workshop.label': 'Workshop',
  'workshop.title': 'How to Think About Technology in Your Business',
  'workshop.desc': 'A practical 30-minute session for business owners who want to use technology better — without becoming technical.',
  'workshop.cta.primary': 'Watch the workshop',
  'workshop.cta.secondary': 'Get the checklist',
  'workshop.topics.1': 'Why most businesses start with the wrong tool',
  'workshop.topics.2': 'How to spot where time is leaking',
  'workshop.topics.3': 'When automation helps — and when it makes things worse',
  'workshop.topics.4': 'Where AI is genuinely useful',
  'workshop.topics.5': 'How to turn your website into a business tool',
  'workshop.topics.6': 'How to pick your first project',

  // Case Studies
  'caseStudies.label': 'Real results',
  'caseStudies.title': 'Real businesses. Real results.',
  'caseStudies.subtitle': 'Not a portfolio. A record of time saved and problems solved.',
  'caseStudies.cta': 'See all results',
  'caseStudies.readMore': 'Read more',

  // Engagement Models
  'services.label': 'How it works',
  'services.title': 'How we can work together',
  'services.subtitle': 'Choose the format that fits where you are.',

  'services.audit.title': 'Start with a clarity session',
  'services.audit.for': "If you're not sure where to start",
  'services.audit.desc': 'A review of your workflows, website, and tools. You get a clear picture of what to fix first.',
  'services.audit.output': 'Written report + recommended first step',

  'services.sprint.title': 'Build the thing',
  'services.sprint.for': 'If you know what needs doing',
  'services.sprint.desc': 'A focused build: automation, website, integration, or internal tool — whatever moves the needle.',
  'services.sprint.output': 'Working system + handoff docs',

  'services.partner.title': 'Ongoing support',
  'services.partner.for': 'If you want a steady hand',
  'services.partner.desc': 'Regular improvements, experiments, and tech decisions — without hiring in-house.',
  'services.partner.output': 'Continuous improvement, month by month',

  'services.whitelabel.title': 'Agency partnership',
  'services.whitelabel.for': "If you're an agency",
  'services.whitelabel.desc': 'Technical execution for your clients — websites, automations, integrations — under your name.',
  'services.whitelabel.output': 'Reliable delivery, white-labelled',

  // About
  'nav.about': 'About',
  'about.label': 'About',
  'about.title': 'I work where business problems meet technical execution.',
  'about.desc': 'My background is in web design and development, but the work has expanded into automation, technical strategy, and AI. I understand both the business conversation and the implementation details.',
  'about.body': 'My background is in web design and development, but the work has expanded into automation, technical strategy, AI workflows, integrations, and digital systems that help businesses operate better. I understand both the business conversation and the implementation details.',
  'about.founder.name': 'Isaac Feldman',
  'about.founder.title': 'Founder of Shiiift',
  'about.founder.bio': 'I spend my time finding practical ways to help people do less repetitive work and make better use of technology. If something on here looks useful, just pick a tool and get started.',

  // Final CTA
  'finalCta.title': 'Ready to get some time back?',
  'finalCta.desc': "Pick a tool or book a short call. Either way, you'll leave with something useful.",
  'finalCta.cta': 'Choose a tool',

  // Thinking
  'thinking.label': 'Thinking',
  'thinking.title': 'Practical notes on technology and work',
  'thinking.subtitle': "Short reads on what actually works — and what doesn't.",
  'thinking.readMore': 'Read',

  // Start / Contact
  'start.title': 'Let\'s talk',
  'start.desc': "Tell me what's going on in your business and I'll tell you what I'd look at first.",
  'start.subtitle': "Tell me what's going on in your business and I'll tell you what I'd look at first.",
  'start.form.name': 'Name',
  'start.form.namePlaceholder': 'Your name',
  'start.form.company': 'Company',
  'start.form.companyPlaceholder': 'Business name (optional)',
  'start.form.businessType': 'What kind of business?',
  'start.form.businessTypePlaceholder': 'e.g. Clinic, Agency, Retailer',
  'start.form.website': 'Website',
  'start.form.websitePlaceholder': 'https://yoursite.com',
  'start.form.bottleneck': "What's your biggest time sink?",
  'start.form.bottleneckPlaceholder': 'What keeps taking up your time?',
  'start.form.challenge': "What's the biggest challenge?",
  'start.form.challengePlaceholder': 'Choose...',
  'start.form.message': 'Anything else?',
  'start.form.messagePlaceholder': "Tell me what's going on...",
  'start.form.email': 'Email',
  'start.form.emailPlaceholder': 'you@example.com',
  'start.form.submit': 'Send',
  'start.form.disclaimer': "No spam. I'll reply within 48 hours.",
  'start.form.success': 'Got it. I\'ll be in touch soon.',

  // Footer
  'footer.tagline': 'Less repetitive work. More time for the things that matter.',
  'footer.rights': 'All rights reserved',

  // Tool shared UI
  'tool.back': 'Back',
  'tool.next': 'Next',
  'tool.seeResults': 'See results',
  'tool.startOver': 'Start over',
  'tool.yourScore': 'Your result',
  'tool.topFindings': 'What we found',
  'tool.quickWins': 'Easy wins',
  'tool.nextActions': 'What to do next',
  'tool.relatedTools': 'Other tools that might help',
  'tool.newsletter.title': 'Get notified when new tools are added',
  'tool.newsletter.placeholder': 'you@example.com',
  'tool.newsletter.cta': 'Notify me',
  'tool.newsletter.disclaimer': "No spam. Just new tools when they're ready.",

  // OS Console
  'console.searchPlaceholder': 'Search tools...',
  'console.backToDashboard': 'Back to tools',
  'console.runTool': 'Start',
  'console.outputLabel': 'You get',
  'console.categories.all': 'All',
  'console.categories.leads': 'Leads',
  'console.categories.ops': 'Automation',
  'console.categories.ai': 'AI',
  'console.categories.strategy': 'Strategy',
  'console.categories.finance': 'Pricing',
};

export default en;
