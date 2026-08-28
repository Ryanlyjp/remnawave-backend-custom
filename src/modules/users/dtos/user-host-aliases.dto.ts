import { createZodDto } from 'nestjs-zod';

import { GetUserHostAliasesCommand, UpdateUserHostAliasesCommand } from '@libs/contracts/commands';

export class GetUserHostAliasesParamDto extends createZodDto(
    GetUserHostAliasesCommand.RequestParamSchema,
) {}
export class GetUserHostAliasesResponseDto extends createZodDto(
    GetUserHostAliasesCommand.ResponseSchema,
) {}
export class UpdateUserHostAliasesParamDto extends createZodDto(
    UpdateUserHostAliasesCommand.RequestParamSchema,
) {}
export class UpdateUserHostAliasesBodyDto extends createZodDto(
    UpdateUserHostAliasesCommand.RequestBodySchema,
) {}
export class UpdateUserHostAliasesResponseDto extends createZodDto(
    UpdateUserHostAliasesCommand.ResponseSchema,
) {}
