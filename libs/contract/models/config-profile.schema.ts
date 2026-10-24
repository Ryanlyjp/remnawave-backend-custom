import { z } from 'zod';

import { ConfigProfileInboundsSchema } from './config-profile-inbounds.schema';
import { CoreEngineSchema } from './core-engine.schema';

export const ConfigProfileSchema = z.object({
    uuid: z.uuid(),
    viewPosition: z.int(),
    name: z.string(),
    engine: CoreEngineSchema,
    tags: z.array(z.string()),
    config: z.unknown(),
    inbounds: z.array(ConfigProfileInboundsSchema),
    nodes: z.array(
        z.object({
            uuid: z.uuid(),
            name: z.string(),
            countryCode: z.string(),
        }),
    ),

    createdAt: z.iso.datetime().transform((str) => new Date(str)),
    updatedAt: z.iso.datetime().transform((str) => new Date(str)),
});
