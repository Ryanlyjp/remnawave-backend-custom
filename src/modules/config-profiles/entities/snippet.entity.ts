import { ConfigProfileSnippets, Prisma } from '@prisma/client';

import { PolicyModuleKind, PolicyModuleScope } from '../constants/policy-module.constants';

export class SnippetEntity implements ConfigProfileSnippets {
    public name: string;
    public kind: PolicyModuleKind | null;
    public scope: PolicyModuleScope | null;
    public description: string | null;
    public snippet: Prisma.JsonArray;
    public createdAt: Date;

    constructor(snippet: Partial<ConfigProfileSnippets>) {
        Object.assign(this, snippet);
        return this;
    }
}
