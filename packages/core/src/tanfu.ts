import CoreEngine from "./engine"
import TanfuAdapter from "./adapter"
import { GLOABAL_TANFU, TANFU_COMPONENT, TANFU_COMPONENT_WATER_MARK } from "./constants"
import { Plugin } from "./plugin"
import TanfuView from "./view"
import { ComponentMetadata } from "./decorators/component"
import { TemplateObject } from "./html"
import { isObject } from "./util"
import TanfuDirective from "./directive"

export type RenderView = any



export default class Tanfu {

    private readonly declarations: Array<{ name: string, value: any }> = []
    private adapter!: TanfuAdapter
    public directives: Map<string, TanfuDirective> = new Map()

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

    directive(name: string, directive: TanfuDirective) {
        this.directives.set(name, directive)
    }

    static directive(name: string, directive: TanfuDirective) {
        getTanfu().directive(name, directive)
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
        engine.addDeclarations(declarations)
        engine.$slot = props?.['$slot']
        function _setEngine(template: TemplateObject[]) {
            template.forEach(item => {
                item.engine = engine
                _setEngine(item.children ?? [])
            })
        }
        // delete props?.['$slot']
        const tTemplate = templateFn()
        _setEngine(tTemplate.children ?? [])
        // 在当前的engine的zone下运行
        return {
            view: engine.zone.run(() => {
                return convertTemplate(tTemplate?.children ?? [])
            }), engine
        }
    }
}

function getTanfu(): Tanfu {
    // @ts-ignore
    return (window[GLOABAL_TANFU] = window[GLOABAL_TANFU] ?? new Tanfu())

}


function convertTemplate(template: TemplateObject[]) {
    return template?.filter(({ type, value }) => type !== Node.TEXT_NODE || value?.trim()).map(templateObject => {
        const { name, type, props, children = [], value, engine, directives } = templateObject || {}
        const View = engine?.getDeclaration(name);
        const dealChildren: TemplateObject[] = []
        children?.forEach((child: TemplateObject) => {
            const { name, props: _props, engine } = child ?? {}
            //解析slot组件
            if (name === 'slot') {
                const slotName = _props?.['name']
                let slotObj = engine?.$slot?.[slotName]
                if (Tanfu.isTanfuView(View)) {
                    if (slotObj) dealChildren.push(slotObj)
                    else dealChildren.push(...child.children ?? [])
                } else if (props) {
                    if (slotObj) props[slotName] = convertTemplate([slotObj])?.[0]
                    else props[slotName] = convertTemplate(child.children ?? [])
                }
                return;
            }
            dealChildren.push(child)
        })
        const idDirective = directives?.find(directive => directive.name === 'id')
        if (idDirective && props) {
            const { expression: tId } = idDirective.descriptors[0]
            props['t-id'] = tId;
            templateObject.tId = tId;
        }
        directives?.forEach((binding) => {
            const { name } = binding
            if (name !== 'id') {
                getTanfu().directives.get(name)?.install(templateObject, binding)
            }
        })
        if (!Tanfu.isTanfuView(View)) delete props?.$slot
        if (props) props['children'] = convertTemplate(dealChildren)
        if (!props?.children?.length) delete props?.['children']
        return getTanfu().getAdapter().createRenderView(type === Node.TEXT_NODE ? value : View, props, type, engine)
    })
}