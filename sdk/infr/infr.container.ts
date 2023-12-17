import {Container} from "@cmmn/core";
import {ResourceTokenStore} from "@infr/yjs/resource-token-store";
import {ResourceTokenApi} from "@infr/resource-token-api.service";
import {TokenVerifier} from "@infr/token-verifier.service";
import {AccountManager} from "@infr/account.manager";

export const InfrContainer = () => Container.withProviders(
    ResourceTokenStore, TokenVerifier, ResourceTokenApi,
    AccountManager
)
