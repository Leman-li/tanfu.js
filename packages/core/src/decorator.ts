import { DESIGN_PARAMTERS, HOST_LIFECYCLE_ID, TANFU_COMPONENT, TANFU_CONTROLLER, TANFU_CONTROLLER_CHILDVIEW, TANFU_EVENTLISTENER, TANFU_INJECT, TANFU_INJECTABLE, TANFU_INJECTABLE_NAME, TANFU_INJECT_PROPS_TOKEN, TANFU_LIFECYCLE, TANFU_WATCHELEMENT } from "./constants"
import { InjectorObject } from "./injector";

type MethodName = string;

/** 用以表明该类属于 Controller */
export function Controller(): ClassDecorator {
    return function (target: any) {
        Reflect.defineMetadata(DESIGN_PARAMTERS, getParameterNames(target), target);
        Reflect.defineMetadata(TANFU_CONTROLLER, true, target)
    }
}

export type ComponentArguments = Omit<Partial<InjectorObject>, 'declarations'> & {
    name?: string,
    declarations?: Array<any | { name: string, value: any }>
}

export type ComponentMetaData = Partial<InjectorObject>

/** 用以声明该类属于视图组件 */
export function Component(args?: ComponentArguments): ClassDecorator {
    const { declarations = [] } = args || {}
    const metaData: ComponentMetaData = {
        ...args,
        declarations: declarations.map(declaration => {
            if (declaration.value) {
                return declaration
            } else {
                const subMetaData = Reflect.getMetadata(TANFU_CONTROLLER, declaration)
                return { 
                    name: (subMetaData?.name || declaration.name)?.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1), value: declaration }
            }
        })
    }
    return function (target: any) {
        Reflect.defineMetadata(TANFU_COMPONENT, metaData, target)
    }
}

/** 用以表明该类是可注入的 */
export function Injectable(): ClassDecorator {
    return function (target: any) {
        // 如果一个类没有定义contructor，则Reflect.getMetadata('design:paramtypes', )不能获取到正确的类型
        target.contructor = (target.contructor ?? function () { })
        Reflect.defineMetadata(TANFU_INJECTABLE, true, target)
    }
}

export interface InjectMetaData {
    [propertyName: string]: string
}

/** 显示注入 */
export function Inject(token: string) {
    return function (target: any, propertyName: string) {
        const metaData: InjectMetaData = Reflect.getMetadata(TANFU_INJECT, target) ?? {}
        metaData[propertyName] = token
        Reflect.defineMetadata(TANFU_INJECT, metaData, target)
    }
}

export type ChildViewMetaData = InjectMetaData

/** 获取子视图 */
export function ChildView(elementId: string){
    return function (target: any, propertyName: string) {
        const metaData: ChildViewMetaData = Reflect.getMetadata(TANFU_CONTROLLER_CHILDVIEW, target) ?? {}
        metaData[propertyName] = elementId
        Reflect.defineMetadata(TANFU_CONTROLLER_CHILDVIEW, metaData, target)
    }
}

export function Props() {
    return Inject(TANFU_INJECT_PROPS_TOKEN)
}

export type LifeCycleName = 'didMount' | 'willUnmount' | 'willMount'

export interface LifeCycleMetaData {
    [elementId: string]: Record<LifeCycleName, MethodName[]>
}

function decoratorErrorHandler(descriptor: PropertyDescriptor, decorator: string) {
    if (typeof descriptor.value != 'function') {
        throw new SyntaxError(`@EventListener can only be used on functions, not: ${descriptor.value}`);
    }
}

/** 主视图生命周期 */
export function HostLifeCycle(lifeCycleName: LifeCycleName) {
    return LifeCycle(HOST_LIFECYCLE_ID, lifeCycleName)
}

/** 子视图生命周期 */
export function LifeCycle(elementId: string, lifeCycleName: LifeCycleName) {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        const metaData: LifeCycleMetaData = (Reflect.getMetadata(TANFU_LIFECYCLE, target) ?? {})
        metaData[elementId] = (metaData[elementId] ?? {})
        metaData[elementId][lifeCycleName] = (metaData[elementId][lifeCycleName] ?? [])
        if (!metaData[elementId][lifeCycleName].includes(methodName)) {
            metaData[elementId][lifeCycleName].push(methodName)
        }
        Reflect.defineMetadata(TANFU_LIFECYCLE, metaData, target)
        return descriptor
    }
}

export interface EventListenerMetaData {
    [elementId: string]: {
        [listenerName: string]: MethodName[]
    }
}

/** 子视图事件监听器 */
export function EventListener(elementId: string, listenerName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const metaData: EventListenerMetaData = (Reflect.getMetadata(TANFU_EVENTLISTENER, target) ?? {})
        metaData[elementId] = (metaData[elementId] ?? {})
        metaData[elementId][listenerName] = (metaData[elementId][listenerName] ?? [])
        if (!metaData[elementId][listenerName].includes(propertyName)) {
            metaData[elementId][listenerName].push(propertyName)
        }
        Reflect.defineMetadata(TANFU_EVENTLISTENER, metaData, target)
        return descriptor
    }
}

export interface WatchElementMetaData {
    [elementId: string]: {
        [propertyName: string]:MethodName[]
    }
}

/** 监听属性变化 */
export function WatchElement(elementId: string, propertyNames: string[]) {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        descriptor.value = descriptor.value.bind(target)
        const metaData: WatchElementMetaData = (Reflect.getMetadata(TANFU_WATCHELEMENT, target) ?? {})
        metaData[elementId] = (metaData[elementId] ?? {})
        propertyNames?.forEach(propertyName => {
            metaData[elementId][propertyName] = (metaData[elementId][propertyName] ?? [])
            if (!metaData[elementId][propertyName].includes(methodName)) {
                metaData[elementId][propertyName].push(methodName)
            }
        })

        Reflect.defineMetadata(TANFU_WATCHELEMENT, descriptor.value, target)
        return descriptor
    }
}


function getParameterNames(fn: Function) {
    if (typeof fn !== 'function') return [];
    var COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var code = fn.toString().replace(COMMENTS, '');
    var result = code.slice(code.indexOf('(') + 1, code.indexOf(')'))
        .match(/([^\s,]+)/g);
    return result === null
        ? []
        : result;
}
