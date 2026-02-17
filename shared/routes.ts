import { z } from 'zod';
import { insertProfileSchema, profiles, schemes, recommendations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  profile: {
    get: {
      method: 'GET' as const,
      path: '/api/profile' as const,
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        404: z.null(), // Profile might not exist yet
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/profile' as const,
      input: insertProfileSchema,
      responses: {
        200: z.custom<typeof profiles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },
  schemes: {
    list: {
      method: 'GET' as const,
      path: '/api/schemes' as const,
      responses: {
        200: z.array(z.custom<typeof schemes.$inferSelect>()),
      },
    },
  },
  recommendations: {
    generate: {
      method: 'POST' as const,
      path: '/api/recommendations/generate' as const,
      responses: {
        200: z.array(z.object({
          scheme: z.custom<typeof schemes.$inferSelect>(),
          explanation: z.string(),
        })),
        400: errorSchemas.validation, // If profile is missing
        401: errorSchemas.unauthorized,
      },
    },
  },
};

// Required buildUrl helper
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
