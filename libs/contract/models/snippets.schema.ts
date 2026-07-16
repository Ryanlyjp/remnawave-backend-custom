import { z } from 'zod';

export const SnippetsSchema = z.object({
    name: z.string(),
    kind: z.enum(['routing-rule-set', 'outbound-set', 'balancer-set']).nullable().optional(),
    scope: z.enum(['shared', 'internal']).nullable().optional(),
    description: z.string().max(255).nullable().optional(),
    snippet: z.unknown(),
});
