import Controller from "./controller"
import CoreEngine from "./engine"

// 函数式插件
type PluginFunction = () => void
// 对象式插件
type PluginObject = { install: () => void }
// 插件
export type Plugin = PluginFunction | PluginObject
// 存储全局元素
const globalElements: Record<string, any> = {}

export const GLOBAL_ELEMENTS_KEY = '__$_TANFU_GLOBAL_ELEMENTS_$__'

export interface Tanfu {
    Controller: typeof Controller;
    CoreEngine: typeof CoreEngine;
    /** 使用插件 */
    use: (plugin: Plugin) => void;
    /** 注册元素 */
    element: (elementId: string, ui: any) => void;
    /** 设置controller的原型 */
    setPrototypeOfController: (key: string, value: any) => void
}

const tanfu: Tanfu = {
    Controller,
    CoreEngine,
    use(plugin: Plugin) {
        if (typeof plugin === 'function') plugin()
        else plugin?.install()
    },
    element(elementId, ui) {
        globalElements[elementId] = ui
    },
    setPrototypeOfController(key, value) {
        //@ts-ignore
        Controller.prototype[key] = value
    },

    /**
     * 全局组件注册,不建议外部使用
     */
    // @ts-ignore
    [GLOBAL_ELEMENTS_KEY]: globalElements
}


export default tanfu;
