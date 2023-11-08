import { HtmlComponent, component } from "@cmmn/ui";

@component({
    name: 'app-root',
    template: (html, state, actions) => html`
        <div>Hello!</div>
    `,
    style: ''
})
export class AppRootComponent extends HtmlComponent<any, any> {
    get State(){
        return {

        }
    }
}