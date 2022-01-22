import { Engine } from "./engine";

// 控制器，负责处理业务逻辑，并处理数据模型和view的交互（MVC中的C）
export default abstract class Controller {

    /** 设置了name的Controller可以被替换 */
    getName(): string | void {
    }

    apply(engine: Engine, controller: Controller) {

    }
}
