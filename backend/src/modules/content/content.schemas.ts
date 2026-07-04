import { z } from 'zod';
import type { ContentSection } from './content.defaults';

const homeSchema = z.object({
  badge: z.string(),
  greeting: z.string(),
  name: z.string().min(1),
  typewriter: z.array(z.string()),
  subtitle: z.string(),
  githubUrl: z.string(),
  linkedinUrl: z.string(),
});

const aboutSchema = z.object({
  personalInfo: z.array(z.object({ label: z.string(), value: z.string() })),
  bioParagraphs: z.array(z.string()),
  skills: z.array(z.string()),
  hobbies: z.array(z.object({ icon: z.string(), name: z.string() })),
});

const servicesSchema = z.object({
  items: z.array(
    z.object({
      icon: z.string(),
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
    })
  ),
});

const contactSchema = z.object({
  email: z.string(),
  phone: z.string(),
  phoneHref: z.string(),
  location: z.string(),
  githubUrl: z.string(),
  linkedinUrl: z.string(),
});

export const sectionSchemas: Record<ContentSection, z.ZodTypeAny> = {
  home: homeSchema,
  about: aboutSchema,
  services: servicesSchema,
  contact: contactSchema,
};
