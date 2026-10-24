import { z } from 'zod';

import { CoreEngineSchema } from './core-engine.schema';

export const SnippetsSchema = z.object({
    name: z.string(),
    engine: CoreEngineSchema,
    kind: z.enum(['routing-rule-set', 'outbound-set', 'balancer-set']).nullable().optional(),
    scope: z.enum(['shared', 'internal']).nullable().optional(),
    description: z.string().max(255).nullable().optional(),
    snippet: z.unknown(),
});
