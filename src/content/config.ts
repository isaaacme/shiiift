import { defineCollection, z } from 'astro:content';

const localeEnum = z.enum(['he', 'en', 'es', 'ru']);

const thinkingCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    meta_description: z.string().optional(),
    featured_image: z.string().optional(),
    date: z.string(),
    lang: localeEnum,
    category: z.string(),
    tags: z.array(z.string()).optional().default([]),
    draft: z.boolean().optional().default(false),
    body: z.string().optional(),
  }),
});

const caseStudiesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    meta_description: z.string().optional(),
    featured_image: z.string().optional(),
    date: z.string(),
    lang: localeEnum,
    tag: z.string(),
    tags: z.array(z.string()).optional().default([]),
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
