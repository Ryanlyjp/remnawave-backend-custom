import { XRayConfig } from '@common/helpers/xray-config';

interface PolicyModuleRefs {
    outbounds?: string[];
    routingRules?: string[];
    balancers?: string[];
}

interface ConfigWithPolicyModules extends Record<string, unknown> {
    outbounds?: Record<string, unknown>[];
    routing?: {
        rules?: Record<string, unknown>[];
        balancers?: Record<string, unknown>[];
    };
    policyModules?: PolicyModuleRefs;
}

const asSnippetRef = (name: string): Record<string, string> => ({ snippet: name });

export const applyPolicyModules = (
    rawConfig: object,
    snippetsMap: Map<string, unknown>,
): XRayConfig => {
    const config = structuredClone(rawConfig) as ConfigWithPolicyModules;
    const moduleRefs = config.policyModules;

    if (moduleRefs?.outbounds?.length) {
        config.outbounds ??= [];
        config.outbounds.push(...moduleRefs.outbounds.map(asSnippetRef));
    }

    if (moduleRefs?.routingRules?.length) {
        config.routing ??= {};
        config.routing.rules ??= [];
        config.routing.rules.push(...moduleRefs.routingRules.map(asSnippetRef));
    }

    if (moduleRefs?.balancers?.length) {
        config.routing ??= {};
        config.routing.balancers ??= [];
        config.routing.balancers.push(...moduleRefs.balancers.map(asSnippetRef));
    }

    delete config.policyModules;

    const xrayConfig = new XRayConfig(config);
    xrayConfig.replaceSnippets(snippetsMap);

    return xrayConfig;
};
