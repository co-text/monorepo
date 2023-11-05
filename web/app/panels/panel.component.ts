import {IEvents, IState, Template} from "./panel.template";
import {component, HtmlComponent} from "@cmmn/ui";
import "./panel.style.less";

@component({
    name: 'ctx-panel',
    template: Template,
    style: ''
})
export class PanelComponent extends HtmlComponent<IState, IEvents> {

    get State() {
        return null;
    }
}
