import { TANFU_COMPONENT, TANFU_COMPONENT_WATER_MARK } from "../constants"
import { Controllers, Declarations, Providers } from "../ioc"


export type ComponentOptions = {
    declarations?: Declarations,
    controllers?: Controllers;
    providers?: Providers
}

export type ComponentMetadata = ComponentOptions

/** 数组去重 */
function filterRepetition<T>(arr: T[], filterFn?: (value: T, index: number) => boolean) {
    const _fn = filterFn ?? function (value: T, index: number) {
        return arr.lastIndexOf(value) === index
    }
    return arr.filter(_fn)
}

function getName(name: string) {
    const returnName = name?.replace(/([A-Z])/g, '-$1').toLowerCase();
    return returnName.startsWith('-') ? returnName.slice(1) : returnName
}

/** 用以声明该类属于视图组件 */
export default function Component(options?: ComponentOptions): ClassDecorator {

    return function (target: any) {
        const { declarations = {}, controllers = [], providers = [] } = options || {}
        const metaData: ComponentMetadata = Reflect.getMetadata(TANFU_COMPONENT, target) ?? {}
        metaData.controllers = filterRepetition((metaData.controllers ?? []).concat(controllers))
        metaData.providers = filterRepetition((metaData.providers ?? []).concat(providers))
        const newDeclarations: Declarations = {};
        Object.keys(declarations).forEach(name => {
            newDeclarations[getName(name)] = declarations[name]
        })
        metaData.declarations = {
            ...metaData.declarations,
            ...newDeclarations
        }
        Reflect.defineMetadata(TANFU_COMPONENT, metaData, target)
        Reflect.defineMetadata(TANFU_COMPONENT_WATER_MARK, true, target)
    }
}