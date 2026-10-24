import { firstValueFrom } from 'rxjs';

import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

import { TypedConfigService } from '@common/config/app-config';

import { applySingboxPolicyModules } from './helpers/singbox-config';
import { ConfigProfileRepository } from './repositories/config-profile.repository';
import { SnippetsRepository } from './repositories/snippets.repository';

@Injectable()
export class SingboxDeploymentService {
    private readonly logger = new Logger(SingboxDeploymentService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: TypedConfigService,
        private readonly configProfileRepository: ConfigProfileRepository,
        private readonly snippetsRepository: SnippetsRepository,
    ) {}

    public async deployProfile(profileUuid: string): Promise<void> {
        const profile = await this.configProfileRepository.getConfigProfileByUUID(profileUuid);
        if (!profile || profile.engine !== 'SINGBOX') return;

        const target = this.configService
            .getOrThrow('CUSTOM_SINGBOX_TARGETS')
            .find((item) => item.profileName === profile.name);

        if (!target) {
            this.logger.warn(`No managed Sing-box target configured for profile "${profile.name}"`);
            return;
        }

        const snippets = await this.snippetsRepository.getAllSnippets();
        const snippetsMap = new Map(
            snippets
                .filter((snippet) => snippet.engine === 'SINGBOX')
                .map((snippet) => [snippet.name, snippet.snippet] as const),
        );
        const config = applySingboxPolicyModules(profile.config as object, snippetsMap);

        try {
            await firstValueFrom(
                this.httpService.put(
                    `${target.url}/config`,
                    { config },
                    {
                        headers: { Authorization: `Bearer ${target.token}` },
                        timeout: 20_000,
                    },
                ),
            );
        } catch {
            throw new Error(`Failed to deploy Sing-box profile "${profile.name}"`);
        }
    }
}
