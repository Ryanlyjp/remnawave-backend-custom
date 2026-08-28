import { createZodDto } from 'nestjs-zod';

import { GetUserHostAliasesCommand, UpdateUserHostAliasesCommand } from '@libs/contracts/commands';

export class GetUserHostAliasesRequestDto extends createZodDto(
    GetUserHostAliasesCommand.RequestSchema,
) {}
export class GetUserHostAliasesResponseDto extends createZodDto(
    GetUserHostAliasesCommand.ResponseSchema,
) {}
export class UpdateUserHostAliasesRequestDto extends createZodDto(
    UpdateUserHostAliasesCommand.RequestSchema,
) {}
export class UpdateUserHostAliasesBodyDto extends createZodDto(
    UpdateUserHostAliasesCommand.RequestBodySchema,
) {}
export class UpdateUserHostAliasesResponseDto extends createZodDto(
    UpdateUserHostAliasesCommand.ResponseSchema,
) {}
