import { DeepPartial, ViewModel } from "./engine";
import html, { TemplateObject } from "./html";
import { DispatchEvent } from "./types";


export class TanfuView<P extends Record<string, any> = {}, VM extends ViewModel = {}> {

    static __TANTU_VIEW_TAG__ = true;

    static extend(){}

    /** 可通过此方法触发事件 */
    dispatchEvent(event: DispatchEvent) {
    }

    template(): TemplateObject {
        return html``
    }
}