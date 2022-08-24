import html, { TemplateObject } from "./html";
import { DispatchEvent } from "./types";

export default class TanfuView {

    propsToState(props: Record<string, any>): Record<string, Record<string, any>> {
        return {}
    }

    /** 可通过此方法触发事件 */
    dispatchEvent(event: DispatchEvent) {
    }

    template(): TemplateObject {
        return html``
    }
}
