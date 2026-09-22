const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const containsSnippetPlaceholder = (value: unknown, snippetName: string): boolean =>
    Array.isArray(value) && value.some((item) => isRecord(item) && item.snippet === snippetName);

export const configReferencesSnippet = (config: object, snippetName: string): boolean => {
    const configRecord = config as Record<string, unknown>;
    const policyModules = isRecord(configRecord.policyModules)
        ? configRecord.policyModules
        : undefined;

    if (
        policyModules &&
        ['outbounds', 'routingRules', 'balancers'].some(
            (key) => Array.isArray(policyModules[key]) && policyModules[key].includes(snippetName),
        )
    ) {
        return true;
    }

    if (containsSnippetPlaceholder(configRecord.outbounds, snippetName)) {
        return true;
    }

    const routing = isRecord(configRecord.routing) ? configRecord.routing : undefined;

    return (
        containsSnippetPlaceholder(routing?.rules, snippetName) ||
        containsSnippetPlaceholder(routing?.balancers, snippetName)
    );
};
