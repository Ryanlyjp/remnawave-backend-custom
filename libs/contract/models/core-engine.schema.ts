import { z } from 'zod';

export const CoreEngineSchema = z.enum(['XRAY', 'SINGBOX']);

export type CoreEngine = z.infer<typeof CoreEngineSchema>;
