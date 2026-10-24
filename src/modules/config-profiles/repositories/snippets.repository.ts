import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma } from '@prisma/client';

import { Injectable } from '@nestjs/common';

import { TxKyselyService } from '@common/database';
import { CoreEngine } from '@libs/contracts/models';

import { SnippetsConverter } from '../converters/snippets.converter';
import { SnippetEntity } from '../entities/snippet.entity';

@Injectable()
export class SnippetsRepository {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly qb: TxKyselyService,
        private readonly snippetsConverter: SnippetsConverter,
    ) {}

    public async create(entity: SnippetEntity): Promise<SnippetEntity> {
        const model = this.snippetsConverter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.configProfileSnippets.create({
            data: {
                ...model,
                snippet: model.snippet as Prisma.InputJsonArray,
            },
        });

        return this.snippetsConverter.fromPrismaModelToEntity(result);
    }

    public async findByName(engine: CoreEngine, name: string): Promise<SnippetEntity | null> {
        const result = await this.prisma.tx.configProfileSnippets.findUnique({
            where: { engine_name: { engine, name } },
        });
        if (!result) {
            return null;
        }
        return this.snippetsConverter.fromPrismaModelToEntity(result);
    }

    public async update({ name, engine, ...data }: SnippetEntity): Promise<SnippetEntity> {
        const result = await this.prisma.tx.configProfileSnippets.update({
            where: {
                engine_name: { engine, name },
            },
            data: {
                ...data,
                snippet: data.snippet as Prisma.InputJsonArray,
            },
        });

        return this.snippetsConverter.fromPrismaModelToEntity(result);
    }

    public async deleteByName(engine: CoreEngine, name: string): Promise<boolean> {
        const result = await this.prisma.tx.configProfileSnippets.delete({
            where: { engine_name: { engine, name } },
        });
        return result !== null;
    }

    public async getAllSnippets(): Promise<SnippetEntity[]> {
        const result = await this.prisma.tx.configProfileSnippets.findMany({
            orderBy: {
                createdAt: 'asc',
            },
        });
        return this.snippetsConverter.fromPrismaModelsToEntities(result);
    }
}
