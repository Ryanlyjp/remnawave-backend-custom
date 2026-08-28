import { z } from 'zod';

import { REST_API, USERS_ROUTES } from '../../api';
import { getEndpointDetails } from '../../constants';
import { UserHostAliasSchema } from './get-user-host-aliases.command';

export namespace UpdateUserHostAliasesCommand {
    export const url = REST_API.USERS.HOST_ALIASES;
    export const TSQ_url = url(':uuid');

    export const endpointDetails = getEndpointDetails(
        USERS_ROUTES.HOST_ALIASES(':uuid'),
        'put',
        'Replace per-user Host aliases',
        { scope: 'host-aliases-write', kind: 'write' },
    );

    export const RequestSchema = z.object({
        uuid: z.string().uuid(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const RequestBodySchema = z.object({
        aliases: z
            .array(
                z.object({
                    hostUuid: z.string().uuid(),
                    remark: z.string().trim().min(1).max(50),
                }),
            )
            .max(10000),
    });

    export type RequestBody = z.infer<typeof RequestBodySchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            userUuid: z.string().uuid(),
            hosts: z.array(UserHostAliasSchema),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
