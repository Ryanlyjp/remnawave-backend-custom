import { z } from 'zod';

import { REST_API, USERS_ROUTES } from '../../api';
import { getEndpointDetails } from '../../constants';
import { numberParamSchema } from '../../models';

export const UserHostAliasSchema = z.object({
    hostUuid: z.string().uuid(),
    viewPosition: z.number().int(),
    defaultRemark: z.string(),
    customRemark: z.string().nullable(),
    effectiveRemark: z.string(),
});

export namespace GetUserHostAliasesCommand {
    export const url = REST_API.USERS.HOST_ALIASES;
    export const TSQ_url = url(':userId');

    export const endpointDetails = getEndpointDetails(
        USERS_ROUTES.HOST_ALIASES(':userId'),
        'get',
        'Get per-user Host aliases',
        { scope: 'host-aliases-read', kind: 'read' },
    );

    export const RequestParamSchema = z.object({
        userId: numberParamSchema,
    });

    export type RequestParam = z.infer<typeof RequestParamSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            userId: z.number(),
            hosts: z.array(UserHostAliasSchema),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
