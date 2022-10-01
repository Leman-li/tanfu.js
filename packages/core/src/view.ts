import Component, { ComponentOptions } from "./decorators/component";
import { ViewModel } from "./engine/types";
import html, { TemplateObject } from "./html";
import { DispatchEvent } from "./types";
import { omit } from "./util";


export default class TanfuView<P extends Record<string, any> = Record<string, any>, VM extends ViewModel = any> {

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
