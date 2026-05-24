import { defineCollection, z } from 'astro:content';

const localeEnum = z.enum(['he', 'en', 'es', 'ru']);

const thinkingCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    lang: localeEnum,
    category: z.string(),
    draft: z.boolean().optional().default(false),
  }),
});

const caseStudiesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    lang: localeEnum,
    tag: z.string(),
    problem: z.string(),
    intervention: z.string(),
    result: z.string(),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = {
  'thinking': thinkingCollection,
  'case-studies': caseStudiesCollection,
};
