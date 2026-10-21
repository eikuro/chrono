import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  // Published posts live anywhere under `posts/`; a folder whose name starts
  // with an underscore is staging material and is never loaded, so an inbox
  // drop cannot fail the schema.
  loader: glob({ base: './posts', pattern: ['**/*.md', '!**/_*/**'] }),
  schema: z.object({
    date: z.coerce.date(),
    description: z.string(),
    lang: z.enum(['en', 'zh']).default('en'),
    name: z.string(),
    tags: z.array(z.string()).default([]),
    translationKey: z.string(),
    type: z.literal('post'),
  }),
});

export const collections = { posts };
