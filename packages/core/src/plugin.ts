import { Engine } from "./engine";

export default class Plugin {

    /** 设置了name的plugin可以被替换 */
    getName(): string | void {

    }

    apply(engine: Engine) {

    }
}