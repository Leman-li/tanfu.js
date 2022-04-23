
import { Engine } from "./engine"
import { GLOABAL_TANFU, GLOBAL_DECLARATIONS } from "./constants"
import CoreEngine from "./engine"
import { TemplateObject } from "./html"
import { InjectorObject } from "./injector"
import { TanfuView } from "./view"

// 函数式插件
type PluginFunction = (tanfu: Tanfu) => void
// 对象式插件
type PluginObject = { install: (tanfu: Tanfu) => void }
// 插件
export type Plugin = PluginFunction | PluginObject
// 存储全局元素
const globalElements: Record<string, any> = {}

export const GLOBAL_ELEMENTS_KEY = '__$_TANFU_GLOBAL_ELEMENTS_$__'

export type RenderView = any

export default class Tanfu {
    static View = TanfuView;
    static CoreEngine = CoreEngine;
    [GLOBAL_DECLARATIONS]: Array<{ name: string, value: any }> = []
    static getInstance() {
        // @ts-ignore
        return (window[GLOABAL_TANFU] = window[GLOABAL_TANFU] ?? new Tanfu())
    }
    static use(plugin: Plugin) {
        if (typeof plugin === 'function') plugin(Tanfu.getInstance())
        else plugin?.install(Tanfu.getInstance())
    }

    static mountView(view: typeof TanfuView) {
        return Tanfu.getInstance().translateTanfuView(view)
    }

    translateTemplate(template: TemplateObject[], declarations: InjectorObject['declarations']): RenderView {

    }

    translateTanfuView(view: typeof TanfuView, elementId?: string): RenderView {
        return view
    }



    addDeclarations(declarations: Array<{ name: string, value: any }>) {
        declarations.forEach(({ name, value }) => {
            if (this[GLOBAL_DECLARATIONS].find(item=> item.name === name)) {
                return console.error(`存在重复的 ${name} 的组件声明`)
            }
            this[GLOBAL_DECLARATIONS].push({name,value})
        })
    }
}

// export interface Tanfu {
//     CoreEngine: typeof CoreEngine;

//     View: typeof View;
//     /** 使用插件 */
//     use: (plugin: Plugin) => void;

//     translateView: (view: typeof View) => any;

//     mountView: (view: typeof View) => any;

//     /** 注册元素 */
//     element: (elementId: string, ui: any) => void;
// }

// const tanfu: Tanfu = {
//     CoreEngine,
//     View,
//     use(plugin: Plugin) {
//         if (typeof plugin === 'function') plugin(tanfu)
//         else plugin?.install(tanfu)
//     },
//     translateView(view) {
//         return view
//     },
//     mountView(view) {
//         return tanfu.translateView(view)
//     },
//     element(elementId, ui) {
//         globalElements[elementId] = ui
//     },

//     /**
//      * 全局组件注册,不建议外部使用
//      */
//     // @ts-ignore
//     [GLOBAL_ELEMENTS_KEY]: globalElements
// }


// export default (function(){
//     // @ts-ignore
//     return window[GLOABAL_TANFU] = window[GLOABAL_TANFU] ?? tanfu
// })() as Tanfu
