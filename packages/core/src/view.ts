import { ViewModel } from "./engine/types";
import html, { TemplateObject } from "./html";
import { DispatchEvent } from "./types";

export default class TanfuView<P = Record<string, any>, VM extends ViewModel = any> {

    propsToState(props: P): VM {
        // @ts-ignore
        return {}
    }

    /** 可通过此方法触发事件 */
    dispatchEvent(event: DispatchEvent) {
    }

    template(): TemplateObject {
        return html``
    }
}
