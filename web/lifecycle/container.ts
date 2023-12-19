import {Container} from "@cmmn/core";
import {useWorkerDomain} from "@cmmn/domain/proxy";
import {uiContainer} from "@ui";
import {storeContainer} from "@stores/container";
import {Api} from "./infr/api";
export const container = Container.withProviders(
    ...uiContainer.getProviders(),
    ...storeContainer.getProviders(),
    ...useWorkerDomain(new Worker("/worker.js", {
        type: "module",
    })).getProviders(),
    Api
)