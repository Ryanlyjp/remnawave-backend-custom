import { z } from 'zod';

import { REST_API, USERS_ROUTES } from '../../api';
import { getEndpointDetails } from '../../constants';

export const UserHostAliasSchema = z.object({
    hostUuid: z.string().uuid(),
    viewPosition: z.number().int(),
    defaultRemark: z.string(),
    customRemark: z.string().nullable(),
    effectiveRemark: z.string(),
});

export namespace GetUserHostAliasesCommand {
    export const url = REST_API.USERS.HOST_ALIASES;
    export const TSQ_url = url(':uuid');

    export const endpointDetails = getEndpointDetails(
        USERS_ROUTES.HOST_ALIASES(':uuid'),
        'get',
        'Get per-user Host aliases',
        { scope: 'host-aliases-read', kind: 'read' },
    );

    export const RequestSchema = z.object({
        uuid: z.string().uuid(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            userUuid: z.string().uuid(),
            hosts: z.array(UserHostAliasSchema),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
