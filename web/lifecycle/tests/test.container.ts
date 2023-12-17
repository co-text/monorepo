import {Container} from "@cmmn/core";
import {storeContainer} from "@stores/container";
import {DomainContainer} from "@cotext/sdk";
import {TestRootComponent} from "./test-root/test-root.component";

export const testContainer = Container.withProviders(
    ...storeContainer.getProviders(),
    ...DomainContainer().getProviders(),
    TestRootComponent
)