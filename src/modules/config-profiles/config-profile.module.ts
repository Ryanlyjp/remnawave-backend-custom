import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ConfigProfileController } from './config-profile.controller';
import { ConfigProfileService } from './config-profile.service';
import { ConfigProfileConverter, SnippetsConverter } from './converters';
import { QUERIES } from './queries';
import { ConfigProfileRepository } from './repositories/config-profile.repository';
import { SnippetsRepository } from './repositories/snippets.repository';
import { SingboxDeploymentService } from './singbox-deployment.service';
import { SnippetsController } from './snippets.controller';
import { SnippetsService } from './snippets.service';

@Module({
    imports: [CqrsModule, HttpModule],
    controllers: [ConfigProfileController, SnippetsController],
    providers: [
        ConfigProfileRepository,
        ConfigProfileService,
        ConfigProfileConverter,
        SnippetsConverter,
        SnippetsService,
        SnippetsRepository,
        SingboxDeploymentService,
        ...QUERIES,
    ],
    exports: [ConfigProfileRepository],
})
export class ConfigProfileModule {}
