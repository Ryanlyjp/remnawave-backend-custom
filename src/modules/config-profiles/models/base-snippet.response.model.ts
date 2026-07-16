import { Prisma } from '@prisma/client';

import { SnippetEntity } from '../entities';
import { PolicyModuleKind, PolicyModuleScope } from '../constants/policy-module.constants';

export class BaseSnippetResponseModel {
    public readonly name: string;
    public readonly kind: PolicyModuleKind | null;
    public readonly scope: PolicyModuleScope | null;
    public readonly description: string | null;
    public readonly snippet: Prisma.JsonArray;
    public readonly createdAt: Date;

    constructor(entity: SnippetEntity) {
        this.name = entity.name;
        this.kind = entity.kind ?? null;
        this.scope = entity.scope ?? null;
        this.description = entity.description ?? null;
        this.snippet = entity.snippet;
        this.createdAt = entity.createdAt;
    }
}
