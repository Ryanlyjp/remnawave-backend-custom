import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { Injectable, Logger } from '@nestjs/common';

import { fail, ok, TResult } from '@common/types';
import { ERRORS } from '@libs/contracts/constants/errors';
import { CoreEngine } from '@libs/contracts/models';

import { NodesQueuesService } from '@queue/_nodes';

import { PolicyModuleKind, PolicyModuleScope } from './constants/policy-module.constants';
import { SnippetEntity } from './entities';
import { validatePolicyModuleInput } from './helpers/policy-module-validator';
import { GetSnippetsResponseModel } from './models';
import { ConfigProfileRepository } from './repositories/config-profile.repository';
import { SnippetsRepository } from './repositories/snippets.repository';
import { SingboxDeploymentService } from './singbox-deployment.service';

@Injectable()
export class SnippetsService {
    private readonly logger = new Logger(SnippetsService.name);

    constructor(
        private readonly snippetsRepository: SnippetsRepository,
        private readonly configProfilesRepository: ConfigProfileRepository,
        private readonly nodesQueuesService: NodesQueuesService,
        private readonly singboxDeploymentService: SingboxDeploymentService,
    ) {}

    public async getSnippets(): Promise<TResult<GetSnippetsResponseModel>> {
        try {
            const snippets = await this.snippetsRepository.getAllSnippets();

            return ok(new GetSnippetsResponseModel(snippets, snippets.length));
        } catch (error) {
            this.logger.error(error);
            return fail(ERRORS.GET_SNIPPETS_ERROR);
        }
    }

    public async deleteSnippetByName(engine: CoreEngine, name: string): Promise<TResult<boolean>> {
        try {
            const snippet = await this.snippetsRepository.findByName(engine, name);

            if (!snippet) {
                return fail(ERRORS.SNIPPET_NOT_FOUND);
            }

            await this.snippetsRepository.deleteByName(engine, name);
            await this.restartAffectedProfiles(engine, name, 'deleteSnippet');

            return ok(true);
        } catch (error) {
            this.logger.error(error);
            return fail(ERRORS.DELETE_SNIPPET_BY_NAME_ERROR);
        }
    }

    public async createSnippet(
        name: string,
        snippet: object,
        engine: CoreEngine,
        kind?: PolicyModuleKind | null,
        scope?: PolicyModuleScope | null,
        description?: string | null,
    ): Promise<TResult<GetSnippetsResponseModel>> {
        try {
            validatePolicyModuleInput({
                engine,
                snippet,
                kind,
                scope,
                description,
            });

            const snippetEntity = new SnippetEntity({
                name,
                engine,
                kind,
                scope,
                description,
                snippet,
            });

            await this.snippetsRepository.create(snippetEntity);
            await this.restartAffectedProfiles(engine, name, 'createSnippet');

            return await this.getSnippets();
        } catch (error) {
            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002' &&
                error.meta?.modelName === 'ConfigProfileSnippets' &&
                Array.isArray(error.meta.target)
            ) {
                const fields = error.meta.target as string[];
                if (fields.includes('name')) {
                    return fail(ERRORS.SNIPPET_NAME_ALREADY_EXISTS);
                }
            }
            this.logger.error(error);
            if (error instanceof Error) {
                return fail(ERRORS.SNIPPET_VALIDATION_ERROR.withMessage(error.message));
            }
            return fail(ERRORS.CREATE_CONFIG_PROFILE_ERROR);
        }
    }

    public async updateSnippet(
        name: string,
        snippet: object,
        engine: CoreEngine,
        kind?: PolicyModuleKind | null,
        scope?: PolicyModuleScope | null,
        description?: string | null,
    ): Promise<TResult<GetSnippetsResponseModel>> {
        try {
            validatePolicyModuleInput({
                engine,
                snippet,
                kind,
                scope,
                description,
            });

            const existingSnippet = await this.snippetsRepository.findByName(engine, name);

            if (!existingSnippet) {
                return fail(ERRORS.SNIPPET_NOT_FOUND);
            }

            const snippetEntity = new SnippetEntity({
                name,
                engine,
                kind,
                scope,
                description,
                snippet,
            });

            await this.snippetsRepository.update(snippetEntity);
            await this.restartAffectedProfiles(engine, name, 'updateSnippet');

            return await this.getSnippets();
        } catch (error) {
            this.logger.error(error);

            if (
                error instanceof PrismaClientKnownRequestError &&
                error.code === 'P2002' &&
                error.meta?.modelName === 'ConfigProfileSnippets' &&
                Array.isArray(error.meta.target)
            ) {
                const fields = error.meta.target as string[];
                if (fields.includes('name')) {
                    return fail(ERRORS.SNIPPET_NAME_ALREADY_EXISTS);
                }
            }

            if (error instanceof Error) {
                return fail(ERRORS.SNIPPET_VALIDATION_ERROR.withMessage(error.message));
            }

            return fail(ERRORS.UPDATE_SNIPPET_ERROR);
        }
    }

    public async syncSnippet(engine: CoreEngine, name: string): Promise<TResult<boolean>> {
        try {
            await this.restartAffectedProfiles(engine, name, 'syncSnippet');

            return ok(true);
        } catch (error) {
            this.logger.error(error);
            return fail(ERRORS.SYNC_SNIPPET_ERROR);
        }
    }

    private async restartAffectedProfiles(
        engine: CoreEngine,
        name: string,
        emitter: string,
    ): Promise<void> {
        const affectedProfiles = await this.configProfilesRepository.getUuidsBySnippetName(
            engine,
            name,
        );

        if (affectedProfiles.length === 0) {
            return;
        }

        this.logger.log(
            `Snippet "${name}" sync queued for ${affectedProfiles.length} config profile(s)`,
        );

        if (engine === 'XRAY') {
            for (const profileUuid of affectedProfiles) {
                await this.nodesQueuesService.startAllNodesByProfile({
                    profileUuid,
                    emitter,
                    force: true,
                });
            }
        } else {
            for (const profileUuid of affectedProfiles) {
                await this.singboxDeploymentService.deployProfile(profileUuid);
            }
        }
    }
}
