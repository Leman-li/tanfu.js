import { TANFU_COMPONENT, TANFU_COMPONENT_WATER_MARK } from "../constants"
import { Controllers, Providers } from "../ioc"

export type ComponentOptions = {
    name?: string,
    declarations?: Array<any | { name: string, value: any }>,
    controllers?: Controllers;
    providers?: Providers
}

export type ComponentMetadata = ComponentOptions

/** 用以声明该类属于视图组件 */
export default function Component(options?: ComponentOptions): ClassDecorator {
    const { declarations = [] } = options || {}
    const metaData: ComponentMetadata = {
        ...options,
        declarations: declarations.map(declaration => {
            if (declaration.value) {
                return declaration
            } else {
                return {
                    name: declaration.name?.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1), value: declaration
                }
            }
        })
    }
    return function (target: any) {
        Reflect.defineMetadata(TANFU_COMPONENT, metaData, target)
        Reflect.defineMetadata(TANFU_COMPONENT_WATER_MARK, true, target)
    }
}