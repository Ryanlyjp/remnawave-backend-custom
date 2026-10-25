interface PolicyModuleRefs {
    outbounds?: string[];
    routingRules?: string[];
}

interface SingboxConfig extends Record<string, unknown> {
    inbounds?: Record<string, unknown>[];
    outbounds?: Record<string, unknown>[];
    route?: {
        rules?: Record<string, unknown>[];
        [key: string]: unknown;
    };
    policyModules?: PolicyModuleRefs;
}

interface SingboxInboundSummary {
    network: null;
    port: number | null;
    rawInbound: Record<string, unknown>;
    security: null;
    tag: string;
    type: string;
}

const resolveModules = (
    names: string[],
    snippetsMap: Map<string, unknown>,
): Record<string, unknown>[] => {
    return names.flatMap((name) => {
        const snippet = snippetsMap.get(name);
        if (snippet === undefined) {
            return [];
        }
        if (!Array.isArray(snippet)) {
            throw new Error(`Sing-box policy module must be an array: ${name}`);
        }
        return snippet as Record<string, unknown>[];
    });
};

export const validateSingboxConfig = (rawConfig: object): SingboxConfig => {
    if (!rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) {
        throw new Error('Sing-box config must be a JSON object');
    }

    const config = structuredClone(rawConfig) as SingboxConfig;

    if (!Array.isArray(config.inbounds) || !Array.isArray(config.outbounds)) {
        throw new Error('Sing-box config must contain inbounds and outbounds arrays');
    }

    if (config.route !== undefined && typeof config.route !== 'object') {
        throw new Error('Sing-box route must be a JSON object');
    }

    return config;
};

export const getSingboxInbounds = (config: SingboxConfig): SingboxInboundSummary[] =>
    config.inbounds!.map((inbound) => {
        if (typeof inbound.tag !== 'string' || typeof inbound.type !== 'string') {
            throw new Error('Sing-box inbounds must contain string tag and type fields');
        }

        return {
            tag: inbound.tag,
            type: inbound.type,
            network: null,
            security: null,
            port: typeof inbound.listen_port === 'number' ? inbound.listen_port : null,
            rawInbound: inbound,
        };
    });

export const applySingboxPolicyModules = (
    rawConfig: object,
    snippetsMap: Map<string, unknown>,
): SingboxConfig => {
    const config = validateSingboxConfig(rawConfig);
    const moduleRefs = config.policyModules;

    if (moduleRefs?.outbounds?.length) {
        config.outbounds!.push(...resolveModules(moduleRefs.outbounds, snippetsMap));
    }

    if (moduleRefs?.routingRules?.length) {
        config.route ??= {};
        config.route.rules ??= [];
        config.route.rules.push(...resolveModules(moduleRefs.routingRules, snippetsMap));
    }

    delete config.policyModules;
    return config;
};

export const getTuicSubscriptionRemark = (subscriptionUrl: string): string =>
    decodeURIComponent(new URL(subscriptionUrl).hash.slice(1));

export const buildTuicSubscriptionLink = (
    rawConfig: object,
    subscriptionUrl: string,
    remark?: string,
): string => {
    const config = validateSingboxConfig(rawConfig);
    const inbound = config.inbounds!.find((item) => item.type === 'tuic');
    const users = inbound?.users;
    const user = Array.isArray(users) ? users[0] : undefined;

    if (
        !user ||
        typeof user !== 'object' ||
        typeof user.uuid !== 'string' ||
        typeof user.password !== 'string'
    ) {
        throw new Error('Managed TUIC profile must contain a UUID and password');
    }

    const url = new URL(subscriptionUrl);
    url.username = user.uuid;
    url.password = user.password;
    if (remark) url.hash = remark;

    return url.toString();
};
