import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { Injectable, Logger } from '@nestjs/common';

import { fail, ok, TResult } from '@common/types';
import { ERRORS } from '@libs/contracts/constants/errors';

import { NodesQueuesService } from '@queue/_nodes';

import { PolicyModuleKind, PolicyModuleScope } from './constants/policy-module.constants';
import { SnippetEntity } from './entities';
import { validatePolicyModuleInput } from './helpers/policy-module-validator';
import { GetSnippetsResponseModel } from './models';
import { ConfigProfileRepository } from './repositories/config-profile.repository';
import { SnippetsRepository } from './repositories/snippets.repository';

@Injectable()
export class SnippetsService {
    private readonly logger = new Logger(SnippetsService.name);

    constructor(
        private readonly snippetsRepository: SnippetsRepository,
        private readonly configProfilesRepository: ConfigProfileRepository,
        private readonly nodesQueuesService: NodesQueuesService,
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

    public async deleteSnippetByName(name: string): Promise<TResult<boolean>> {
        try {
            const snippet = await this.snippetsRepository.findByName(name);

            if (!snippet) {
                return fail(ERRORS.SNIPPET_NOT_FOUND);
            }

            await this.snippetsRepository.deleteByName(name);

            return ok(true);
        } catch (error) {
            this.logger.error(error);
            return fail(ERRORS.DELETE_SNIPPET_BY_NAME_ERROR);
        }
    }

    public async createSnippet(
        name: string,
        snippet: object,
        kind?: PolicyModuleKind | null,
        scope?: PolicyModuleScope | null,
        description?: string | null,
    ): Promise<TResult<GetSnippetsResponseModel>> {
        try {
            validatePolicyModuleInput({
                snippet,
                kind,
                scope,
                description,
            });

            const snippetEntity = new SnippetEntity({
                name,
                kind,
                scope,
                description,
                snippet,
            });

            await this.snippetsRepository.create(snippetEntity);

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
        kind?: PolicyModuleKind | null,
        scope?: PolicyModuleScope | null,
        description?: string | null,
    ): Promise<TResult<GetSnippetsResponseModel>> {
        try {
            validatePolicyModuleInput({
                snippet,
                kind,
                scope,
                description,
            });

            const existingSnippet = await this.snippetsRepository.findByName(name);

            if (!existingSnippet) {
                return fail(ERRORS.SNIPPET_NOT_FOUND);
            }

            const snippetEntity = new SnippetEntity({
                name,
                kind,
                scope,
                description,
                snippet,
            });

            await this.snippetsRepository.update(snippetEntity);

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

    public async syncSnippet(name: string): Promise<TResult<boolean>> {
        try {
            const affectedProfiles = await this.resolveAffectedProfiles(name);

            for (const profileUuid of affectedProfiles) {
                await this.nodesQueuesService.startAllNodesByProfile({
                    profileUuid,
                    emitter: 'syncSnippet',
                    force: true,
                });
            }

            this.logger.log(
                `Snippet "${name}" sync queued for ${affectedProfiles.length} config profile(s)`,
            );

            return ok(true);
        } catch (error) {
            this.logger.error(error);
            return fail(ERRORS.SYNC_SNIPPET_ERROR);
        }
    }

    private async resolveAffectedProfiles(name: string): Promise<string[]> {
        return await this.configProfilesRepository.getUuidsBySnippetName(name);
    }
}
