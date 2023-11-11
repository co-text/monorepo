import {Container} from "@cmmn/core";
import {uiContainer} from "@ui";
import {storeContainer} from "@stores/container";
import {DomainContainer} from "@cotext/sdk";
export const container = Container.withProviders(
    ...uiContainer.getProviders(),
    ...storeContainer.getProviders(),
    ...DomainContainer().getProviders()
)