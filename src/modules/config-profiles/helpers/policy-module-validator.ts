import {
    POLICY_MODULE_KINDS,
    POLICY_MODULE_SCOPES,
    PolicyModuleKind,
    PolicyModuleScope,
} from '../constants/policy-module.constants';

export interface PolicyModuleInput {
    kind?: PolicyModuleKind | null;
    scope?: PolicyModuleScope | null;
    description?: string | null;
    snippet: object;
}

export const validatePolicyModuleInput = ({
    kind,
    scope,
    description,
    snippet,
}: PolicyModuleInput): void => {
    if (!Array.isArray(snippet) || snippet.length === 0) {
        throw new Error('Snippet cannot be empty');
    }

    if (snippet.some((item) => !item || typeof item !== 'object' || Object.keys(item).length === 0)) {
        throw new Error('Snippet cannot contain empty objects');
    }

    if (kind !== undefined && kind !== null && !POLICY_MODULE_KINDS.includes(kind)) {
        throw new Error(`Unsupported policy module kind: ${kind}`);
    }

    if (scope !== undefined && scope !== null && !POLICY_MODULE_SCOPES.includes(scope)) {
        throw new Error(`Unsupported policy module scope: ${scope}`);
    }

    if (description !== undefined && description !== null && description.length > 255) {
        throw new Error('Policy module description must be less than 255 characters');
    }

    if (!kind) {
        return;
    }

    const validators: Record<PolicyModuleKind, (item: Record<string, unknown>) => boolean> = {
        'routing-rule-set': (item) => 'type' in item || 'outboundTag' in item || 'balancerTag' in item,
        'outbound-set': (item) => 'protocol' in item && 'tag' in item,
        'balancer-set': (item) => 'tag' in item && ('selector' in item || 'strategy' in item),
    };

    const isValid = validators[kind];

    for (const item of snippet as Record<string, unknown>[]) {
        if (!isValid(item)) {
            throw new Error(`Snippet payload does not match policy module kind: ${kind}`);
        }
    }
};
