import {Container} from "@cmmn/core";
import {AppRootComponent} from "./app-root/app-root.component";
import {AppMainComponent} from "./app-main/app-main.component";
import {AppLayoutComponent} from "./app-layout/app-layout.component";
import "./global.less";
import {AppHighComponent} from "./app-high/app-high.component";
import {AppResultComponent} from "./app-result/app-result.component";
import {UnderComponent} from "./under/under.component";
import {AppInboxComponent} from "./app-inbox/app-inbox.component";
import {HeaderComponent} from "./header/header.component";
export const uiContainer = Container.withProviders(
    AppRootComponent,
    AppInboxComponent,
    AppMainComponent,
    AppLayoutComponent,
    AppHighComponent,
    AppResultComponent,
    UnderComponent,
    HeaderComponent
)