import TanfuTarget from "../tanfu-target";
import { createMethodArgsDecorator, TanfuMethodParamType } from "./create-method-args-decorator";

/**
 * Event修饰器
 * @returns 
 */
export default function Event(){
    return createMethodArgsDecorator(TanfuMethodParamType.TANFU_EVENT)
}

export interface TanfuEvent<V extends object> {
    target: TanfuTarget,
    timeStamp: number,
    payload: V
}