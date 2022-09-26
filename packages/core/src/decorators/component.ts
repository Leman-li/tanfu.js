import { TANFU_COMPONENT, TANFU_COMPONENT_WATER_MARK } from "../constants"
import { Controllers, Providers } from "../ioc"

export type ComponentOptions = {
    name?: string,
    declarations?: Array<any | { name: string, value: any }>,
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

function getName(declaration: any) {
    const metaData: ComponentMetadata = Reflect.getMetadata(TANFU_COMPONENT, declaration);
    const name = metaData?.name || declaration?.name
    const returnName = name?.replace(/([A-Z])/g, '-$1').toLowerCase();
    return returnName.startsWith('-') ? returnName.slice(1) : returnName
}

/** 用以声明该类属于视图组件 */
export default function Component(options?: ComponentOptions): ClassDecorator {

    return function (target: any) {
        const { declarations = [], controllers = [], providers = [], name } = options || {}
        const metaData: ComponentMetadata = Reflect.getMetadata(TANFU_COMPONENT, target) ?? {}
        metaData.name = name ?? metaData.name;
        metaData.controllers = filterRepetition((metaData.controllers ?? []).concat(controllers))
        metaData.providers = filterRepetition((metaData.providers ?? []).concat(providers))
        const mergeDeclarations: Array<{ name: string, value: any }> = (metaData.declarations ?? []).concat(declarations.map(declaration => ({
            name: getName(declaration),
            value: declaration.value ?? declaration
        })
        ))
        const mergeDeclarationNames = mergeDeclarations?.map(item => item.name)
        metaData.declarations = filterRepetition(mergeDeclarations, (value, index) => mergeDeclarationNames.lastIndexOf(value.name) === index)
        Reflect.defineMetadata(TANFU_COMPONENT, metaData, target)
        Reflect.defineMetadata(TANFU_COMPONENT_WATER_MARK, true, target)
    }
}