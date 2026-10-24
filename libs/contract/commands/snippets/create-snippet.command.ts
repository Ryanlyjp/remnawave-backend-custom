import { z } from 'zod';

import { REST_API, SNIPPETS_ROUTES } from '../../api';
import { getEndpointDetails } from '../../constants';
import { CoreEngineSchema, SnippetsSchema } from '../../models';

export namespace CreateSnippetCommand {
    export const url = REST_API.SNIPPETS.CREATE;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        SNIPPETS_ROUTES.CREATE,
        'post',
        'Create snippet',
        { scope: 'create', kind: 'write' },
    );

    export const RequestBodySchema = z.object({
        name: z
            .string()
            .min(2)
            .max(255)
            .regex(
                /^[A-Za-z0-9_ -]+(\/[A-Za-z0-9_ -]+)*$/,
                'Name can only contain letters, numbers, underscores, dashes, slashes and spaces',
            ),
        engine: CoreEngineSchema.default('XRAY'),
        kind: z.enum(['routing-rule-set', 'outbound-set', 'balancer-set']).optional().nullable(),
        scope: z.enum(['shared', 'internal']).optional().nullable(),
        description: z.string().max(255).optional().nullable(),
        snippet: z.array(z.looseObject({})),
    });

    export const ResponseSchema = z.object({
        response: z.object({
            total: z.number(),
            snippets: z.array(SnippetsSchema),
        }),
    });

    export type RequestBody = z.infer<typeof RequestBodySchema>;
    export type Response = z.infer<typeof ResponseSchema>;
}
