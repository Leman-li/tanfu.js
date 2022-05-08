
import { Engine } from "./engine"
import { GLOABAL_TANFU, GLOBAL_DECLARATIONS, TANFU_COMPONENT } from "./constants"
import CoreEngine from "./engine"
import { TemplateObject } from "./html"
import { InjectorObject } from "./ioc"
import { TanfuView } from "./view"
import { Component, ComponentMetaData } from "./decorator"

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

    static isTanfuView(View: any) {
        return View?.__TANTU_VIEW_TAG__
    }

    static mountView(View: typeof TanfuView) {
        return Tanfu.getInstance().createRenderView(View, {})
    }

    createRenderView(View: any, props: any, type: number): any {

    }

    static translateTanfuView(View: typeof TanfuView, props?: any): {
        view: RenderView,
        engine: CoreEngine
    } {
        const metaData: ComponentMetaData = Reflect.getMetadata(TANFU_COMPONENT, View)
        const view = new View()
        const { template: templateFn } = view
        const declarations = [...metaData?.declarations ?? [], ...Tanfu.getInstance()[GLOBAL_DECLARATIONS]]
        const engine = new CoreEngine(
            Zone.current.get('engine'),
            metaData.providers ?? [],
            metaData.controllers ?? [],
            { tId: props?.['t-id'], view }
        )
        // 在当前的engine的zone下运行
        return {
            view: engine.zone.run(() => {
                return convertTemplate(templateFn()?.children ?? [], declarations, Tanfu.getInstance())
            }), engine
        }
    }

    addDeclarations(declarations: Array<{ name: string, value: any }>) {
        declarations.forEach(({ name, value }) => {
            this[GLOBAL_DECLARATIONS].push({ name, value })
        })
    }
}

function convertTemplate(template: TemplateObject[], declarations: Record<string, any>[], tanfu: Tanfu) {
    return template?.filter(({type, value}) => type !== Node.TEXT_NODE || value?.trim() ).map(templateObject => {
        const { name, type, props, children = [], value } = templateObject || {}
        const View = declarations?.find(item => item.name === name)?.value
        if (props)
            props['children'] = convertTemplate(children, declarations, tanfu)
        const childrenView: any = []
        // 支持slot
        props?.['children']?.forEach((child: any, index: number) => {
            const slotName = children?.[index]?.props?.['t-slot']
            if (slotName) {
                props[slotName] = child
            } else childrenView.push(child)
        })
        if (props) props['children'] = childrenView
        if(!props?.['children']?.length)delete props?.['children']
        return tanfu.createRenderView(type === Node.TEXT_NODE ? value : View, props, type)
    })
}