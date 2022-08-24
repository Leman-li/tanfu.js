import { Component, TanfuView, html } from "tanfu-core";
import { TemplateObject } from "tanfu-core/es/html";
import AViewController from "./index.controller";
import AViewModel from "./index.model";
@Component()
class BlankView extends TanfuView {
    template(): TemplateObject {
        return html`<div>sdfafdsa</div>`
    }
}
@Component({
    controllers: [AViewController],
    providers: [AViewModel],
    declarations: [BlankView]
})
export default class AView extends TanfuView {

    template(): TemplateObject {
        return html`
        <div t-id="div">Aview<blank-view/></div>
        `
    }
}
