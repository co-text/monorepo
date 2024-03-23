import { Container } from "@cmmn/core";
import { UserStore } from "./user.store";

export const storeContainer = Container.withProviders(
    UserStore
)