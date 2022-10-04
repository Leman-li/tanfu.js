import { TANFU_INJECT } from "../constants"
import { createMethodArgsDecorator, TanfuMethodParamType } from './create-method-args-decorator'

export interface InjectMetadata {
    [propertyName: string]: string
}

/** 显示注入 */
export default function Inject(token: string) {
    return function (target: any, propertyName: string, index?: number) {
        // 如果index为number说明作用在方法参数上，否则作用的属性上
        if (typeof index !== 'number') {
            const metaData: InjectMetadata = Reflect.getMetadata(TANFU_INJECT, target) ?? {}
            metaData[propertyName] = token
            Reflect.defineMetadata(TANFU_INJECT, metaData, target);
            return;
        }
        return createMethodArgsDecorator(TanfuMethodParamType.TANFU_CONSTRUCTOR_INJECT)(token)(target, propertyName || 'constructor', index)
    }
}