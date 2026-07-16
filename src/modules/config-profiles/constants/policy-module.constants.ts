export const POLICY_MODULE_KINDS = [
    'routing-rule-set',
    'outbound-set',
    'balancer-set',
] as const;

export type PolicyModuleKind = (typeof POLICY_MODULE_KINDS)[number];

export const POLICY_MODULE_SCOPES = ['shared', 'internal'] as const;

export type PolicyModuleScope = (typeof POLICY_MODULE_SCOPES)[number];
