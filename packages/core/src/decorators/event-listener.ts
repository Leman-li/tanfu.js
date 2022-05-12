import { TANFU_EVENTLISTENER } from "../constants"

export interface EventListenerMetadata {
    [tId: string]: {
        [eventName: string]: string[]
    }
}

/** 子视图事件监听器 */
export default function EventListener(tId: string, eventName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const metaData: EventListenerMetadata = (Reflect.getMetadata(TANFU_EVENTLISTENER, target) ?? {})
        metaData[tId] = (metaData[tId] ?? {})
        metaData[tId][eventName] = (metaData[tId][eventName] ?? [])
        if (!metaData[tId][eventName].includes(propertyName)) {
            metaData[tId][eventName].push(propertyName)
        }
        Reflect.defineMetadata(TANFU_EVENTLISTENER, metaData, target)
        return descriptor
    }
}