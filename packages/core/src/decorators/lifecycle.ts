import { HOST_LIFECYCLE_ID, TANFU_LIFECYCLE } from "../constants";

export type LifeCycleName = 'didMount' | 'willUnmount' | 'willMount'

export type HostLifeCycleName = LifeCycleName | 'update'

export interface LifeCycleMetadata {
    [tId: string]: Record<LifeCycleName, string[]>
}

function decoratorErrorHandler(descriptor: PropertyDescriptor, decorator: string) {
    if (typeof descriptor.value != 'function') {
        throw new SyntaxError(`@EventListener can only be used on functions, not: ${descriptor.value}`);
    }
}

/** 主视图生命周期 */
export function HostLifeCycle(lifeCycleName: HostLifeCycleName) {
    return LifeCycle(HOST_LIFECYCLE_ID, lifeCycleName as any)
}

/** 子视图生命周期 */
export default function LifeCycle(tId: string, lifeCycleName: LifeCycleName) {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const metaData: LifeCycleMetadata = (Reflect.getMetadata(TANFU_LIFECYCLE, target) ?? {})
        metaData[tId] = (metaData[tId] ?? {})
        metaData[tId][lifeCycleName] = (metaData[tId][lifeCycleName] ?? [])
        if (!metaData[tId][lifeCycleName].includes(methodName)) {
            metaData[tId][lifeCycleName].push(methodName)
        }
        Reflect.defineMetadata(TANFU_LIFECYCLE, metaData, target)
        return descriptor
    }
}