import { AccessInheritanceRule, IRuleStore, URI } from "@inhauth/core";
import { getOrAdd } from "@cmmn/core";

export class RuleStore implements IRuleStore {

    private rules = new Map<URI, AccessInheritanceRule[]>();

    public async GetRules(resource: URI): Promise<AccessInheritanceRule[]> {
        return this.rules.get(resource) ?? [];
    }

    public async AddRule(uri: URI, rule: AccessInheritanceRule) {
        getOrAdd(this.rules, uri, () => []).push(rule);
    }
}