import {Container} from "@cmmn/core";
import {AppRootComponent} from "./blocks/app-root/app-root.component";
import {AppMainComponent} from "./blocks/app-main/app-main.component";
import {AppLayoutComponent} from "./blocks/app-layout/app-layout.component";
import "./global.less";
import {AppHighComponent} from "./blocks/app-high/app-high.component";
import {AppResultComponent} from "./blocks/app-result/app-result.component";
import {UnderComponent} from "./blocks/under/under.component";
import {AppInboxComponent} from "./blocks/app-inbox/app-inbox.component";
import {HeaderComponent} from "./blocks/header/header.component";
import {MessageComponent} from "./components/message/message.component";
import {DivEditorComponent} from "./components/div-editor/editor.component";

export const uiContainer = Container.withProviders(
    AppRootComponent,
    AppInboxComponent,
    AppMainComponent,
    AppLayoutComponent,
    AppHighComponent,
    AppResultComponent,
    UnderComponent,
    HeaderComponent,
    MessageComponent,
    // EditorComponent,
    DivEditorComponent
)