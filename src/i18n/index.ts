import he from './he';
import en from './en';
import es from './es';
import ru from './ru';

export const LOCALES = ['he', 'en', 'es', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'he';

export const RTL_LOCALES: Locale[] = ['he'];

export const LOCALE_LABELS: Record<Locale, string> = {
  he: 'עברית',
  en: 'English',
  es: 'Español',
  ru: 'Русский',
};

export const translations: Record<Locale, typeof he> = { he, en, es, ru };

export function useTranslations(locale: Locale) {
  return function t(key: keyof typeof he): string {
    const dict = translations[locale] as Record<string, string>;
    const fallback = translations['en'] as Record<string, string>;
    return dict[key] ?? fallback[key] ?? key;
  };
}

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split('/');
  if (LOCALES.includes(lang as Locale)) return lang as Locale;
  return DEFAULT_LOCALE;
}

export function getLocalizedPath(path: string, locale: Locale): string {
  const clean = path.replace(/^\/(he|en|es|ru)/, '');
  return `/${locale}${clean || '/'}`;
}
