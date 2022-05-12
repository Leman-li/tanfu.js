import { TANFU_INJECT } from "../constants"

export interface InjectMetadata {
    [propertyName: string]: string
}

/** 显示注入 */
export default function Inject(token: string) {
    return function (target: any, propertyName: string) {
        const metaData: InjectMetadata = Reflect.getMetadata(TANFU_INJECT, target) ?? {}
        metaData[propertyName] = token
        Reflect.defineMetadata(TANFU_INJECT, metaData, target)
    }
}