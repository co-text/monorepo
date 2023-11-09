import {Container} from "@cmmn/core";
import {uiContainer} from "@ui";
import {storeContainer} from "@stores/container";

export const container = Container.withProviders(
    ...uiContainer.getProviders(),
    ...storeContainer.getProviders()
)