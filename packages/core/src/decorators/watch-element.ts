import { HOST_T_ID, TANFU_WATCHELEMENT } from "../constants"

export interface WatchElementMetadata {
    [tId: string]: {
        [propertyName: string]: string[]
    }
}

export function WatchHostElement(propertyNames: string []){
    return WatchElement(HOST_T_ID, propertyNames)
}

/** 监听属性变化 */
export default function WatchElement(tId: string, propertyNames: string[]) {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const metaData: WatchElementMetadata = (Reflect.getMetadata(TANFU_WATCHELEMENT, target) ?? {})
        metaData[tId] = (metaData[tId] ?? {})
        propertyNames?.forEach(propertyName => {
            metaData[tId][propertyName] = (metaData[tId][propertyName] ?? [])
            if (!metaData[tId][propertyName].includes(methodName)) {
                metaData[tId][propertyName].push(methodName)
            }
        })

        Reflect.defineMetadata(TANFU_WATCHELEMENT, metaData , target)
        return descriptor
    }
}