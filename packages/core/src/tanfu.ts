import CoreEngine from "./engine"
import TanfuAdapter from "./adapter"
import { GLOABAL_TANFU, TANFU_COMPONENT, TANFU_COMPONENT_WATER_MARK } from "./constants"
import { Plugin } from "./plugin"
import TanfuView from "./view"
import { ComponentMetadata } from "./decorators/component"
import { TemplateObject } from "./html"
import { isObject } from "./util"



export type RenderView = any



export default class Tanfu {

    private readonly declarations: Array<{ name: string, value: any }> = []
    private adapter!: TanfuAdapter

    getAdapter() {
        return this.adapter
    }


    getDeclarations() {
        return this.declarations
    }


    addDeclarations(declarations: Array<{ name: string, value: any }>) {
        declarations.forEach(({ name, value }) => {
            this.declarations.push({ name, value })
        })
    }

    addAdapter(adapter: TanfuAdapter) {
        this.adapter = adapter
    }


    static use(plugin: Plugin) {
        if (typeof plugin === 'function') plugin(getTanfu())
        else plugin?.install(getTanfu())
    }

    static isTanfuView(View: any) {
        return isObject(View) && Reflect.getMetadata(TANFU_COMPONENT_WATER_MARK, View)
    }

    static createApp(View: typeof TanfuView) {
        return getTanfu().adapter.createRenderView(View, {}, -1)
    }

    static translateTanfuView(View: typeof TanfuView, props?: any): {
        view: RenderView,
        engine: CoreEngine
    } {
        const metaData: ComponentMetadata = Reflect.getMetadata(TANFU_COMPONENT, View)
        const view = new View()
        const { template: templateFn } = view
        const declarations = [...metaData?.declarations ?? [], ...getTanfu().getDeclarations()]
        const engine = new CoreEngine(
            Zone.current.get('engine'),
            metaData.providers ?? [],
            metaData.controllers ?? [],
            { tId: props?.['t-id'], view }
        )
        // 在当前的engine的zone下运行
        return {
            view: engine.zone.run(() => {
                return convertTemplate(templateFn()?.children ?? [], declarations)
            }), engine
        }
    }
}

function getTanfu(): Tanfu {
    // @ts-ignore
    return (window[GLOABAL_TANFU] = window[GLOABAL_TANFU] ?? new Tanfu())

}


function convertTemplate(template: TemplateObject[], declarations: Record<string, any>[]) {
    return template?.filter(({ type, value }) => type !== Node.TEXT_NODE || value?.trim()).map(templateObject => {
        const { name, type, props, children = [], value } = templateObject || {}
        const View = declarations?.find(item => item.name === name)?.value
        if (props)
            props['children'] = convertTemplate(children, declarations)
        const childrenView: any = []
        // 支持slot
        props?.['children']?.forEach((child: any, index: number) => {
            const slotName = children?.[index]?.props?.['t-slot']
            if (slotName) {
                props[slotName] = child
            } else childrenView.push(child)
        })
        if (props) props['children'] = childrenView
        if (!props?.['children']?.length) delete props?.['children']
        return getTanfu().getAdapter().createRenderView(type === Node.TEXT_NODE ? value : View, props, type)
    })
}