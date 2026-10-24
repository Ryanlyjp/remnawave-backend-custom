import { ConfigProfiles } from '@prisma/client';

import { CoreEngine } from '@libs/contracts/models';

export class ConfigProfileEntity implements ConfigProfiles {
    public uuid: string;
    public viewPosition: number;
    public name: string;
    public engine: CoreEngine;
    public tags: string[];
    public config: object;

    public createdAt: Date;
    public updatedAt: Date;

    constructor(configProfile: Partial<ConfigProfiles>) {
        Object.assign(this, configProfile);
        return this;
    }
}
