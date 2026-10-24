import { Prisma } from '@prisma/client';

import { CoreEngine } from '@libs/contracts/models';

import { PolicyModuleKind, PolicyModuleScope } from '../constants/policy-module.constants';
import { SnippetEntity } from '../entities';

export class BaseSnippetResponseModel {
    public readonly name: string;
    public readonly engine: CoreEngine;
    public readonly kind: PolicyModuleKind | null;
    public readonly scope: PolicyModuleScope | null;
    public readonly description: string | null;
    public readonly snippet: Prisma.JsonArray;
    public readonly createdAt: Date;

    constructor(entity: SnippetEntity) {
        this.name = entity.name;
        this.engine = entity.engine;
        this.kind = entity.kind ?? null;
        this.scope = entity.scope ?? null;
        this.description = entity.description ?? null;
        this.snippet = entity.snippet;
        this.createdAt = entity.createdAt;
    }
}
