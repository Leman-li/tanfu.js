import React, { useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { CoreEngine, TanfuView } from 'tanfu-core';
export { Engine, Plugin } from 'tanfu-core'
import get from 'lodash.get'
import { InjectorObject } from 'tanfu-core/es/injector';
import defaultDeclarations from './defaultl-declarations';
import Tanfu from 'tanfu-core';
import { TemplateObject } from 'tanfu-core/es/html';
import { HOST_LIFECYCLE_ID, TANFU_COMPONENT } from 'tanfu-core/es/constants';
import { ComponentMetaData } from 'tanfu-core';






export type ComponentArguments = Omit<Partial<InjectorObject>, 'declarations'> & {
    template: TemplateObject;
    declarations: Array<{ name: string, value: React.ComponentType<any> }>
}

export default class TanfuReactPlugin {
    install(tanfu: Tanfu) {
        tanfu.addDeclarations(defaultDeclarations)
        tanfu.translateTemplate = (template, declarations) => {
            return convertTemplate(template, declarations, tanfu)
        }
        tanfu.translateTanfuView = (view, elementId) => {
            return translateReactView(view, tanfu, elementId)
        }
    }
}




/** 转换Template对象为 React组件 */
function convertTemplate(template: TemplateObject[], declarations: Record<string, any>[], tanfu: Tanfu) {
    const views: any = [];
    template?.forEach(templateObject => {
        const { name, elementId, type, value } = templateObject || {}
        let Component = declarations?.find(item => item.name === name)?.value
        const props = { ...templateObject.props }
        if (Component?.__TANTU_VIEW_TAG__) {
            props['elementId'] = props['element-id']
            Component = tanfu.translateTanfuView(Component, elementId)
            Component = createElement(Component)
        } else if (Component) {
            // 说明是React组件
            Component = createElement(Component)
            props['elementId'] = props['element-id']
        }
        if (type === Node.TEXT_NODE) {
            // 普通的文本
            views.push(value)
            return;
        }
        const children: any = convertTemplate(templateObject.children || [], declarations, tanfu)
        if (Component) views.push(
            <Component {...props}>{children}</Component>)

    })
    return views
}

function translateReactView(View: typeof Tanfu.View, tanfu: Tanfu, elementId?: string): React.ComponentType<any> {
    const metaData: ComponentMetaData = Reflect.getMetadata(TANFU_COMPONENT, View)
    const view = new View()
    const { template: templateFn } = view
    const declarations = [...metaData?.declarations ?? [], ...tanfu._$GLOBAL_DECLARATIONS$_]
    // @ts-ignore
    const children = tanfu.translateTemplate(templateFn()?.children ?? [], declarations ?? [])
    return function () {
        return <ReactView {...metaData} view={{ view, elementId }} declarations={declarations as any}>{children}</ReactView>
    }
}


// @ts-ignore
const ReactViewContext = React.createContext<CoreEngine>(null);


interface ReactViewProps {
    children: React.ReactChild;
    controllers?: InjectorObject['controllers'];
    providers?: InjectorObject['providers'],
    declarations?: InjectorObject['declarations'];
    elements?: Record<string, React.ComponentType<any>>;
    view: { view: TanfuView, elementId?: string }
}


/** 包裹React视图组件，生成CoreEngine并执行控制器 */
function ReactView({ children, providers = [], controllers = [], elements = {}, declarations = [], view }: ReactViewProps) {
    const parentEngine = useContext(ReactViewContext)
    const engine = useMemo(() => {
        const engine = new CoreEngine();
        engine.addParentCoreEngine(parentEngine)
        engine.registerElements(elements)
        engine.inject({
            providers,
            controllers,
            declarations,
        })
        engine.addHostView(view)
        engine._willMountFns[HOST_LIFECYCLE_ID]?.forEach(fn => fn?.())
        return engine;
    }, [])

    useEffect(() => {
        parentEngine?.addViewToController()
        engine._didMountFns[HOST_LIFECYCLE_ID]?.forEach(fn => fn?.())
        return () => {
            engine._willUnmountFns[HOST_LIFECYCLE_ID]?.forEach(fn => fn?.())
        }
    }, [])
    return <ReactViewContext.Provider value={engine}>{children}</ReactViewContext.Provider>
}

type UIComponent<P> = React.NamedExoticComponent<React.ComponentProps<React.ComponentType<P>> & { elementId?: string }>

type Element<P> = UIComponent<P>

/** 创建视图元素 */
function createElement<P = {}>(
    UI: React.ComponentType<P>
): Element<P> {
    return React.memo(function (props: React.ComponentProps<typeof UI> & { elementId?: string }) {
        const { elementId, ...others } = props
        // 获取engine
        const engine = useContext(ReactViewContext)

        useMemo(() => {
            elementId && engine._willMountFns[elementId]?.forEach(fn => fn?.())
        }, [elementId])

        // 获取元素state
        const state = elementId ? engine?.getState(elementId) : {}

        // useEffect(() => {
        //     engine.setState(others)
        // }, [...Object.values(others)])

        // 构建injectCallback生成的回调属性 
        const callbackFnProps = useMemo(() => {
            if (elementId && engine?._callBackFns[elementId]) {
                const callbackFns = engine?._callBackFns[elementId];
                const _callbackFnProps: any = {}
                Object.keys(callbackFns).forEach(fnName => {
                    _callbackFnProps[fnName] = (...args: any[]) => {
                        // @ts-ignore
                        others?.[fnName]?.()
                        callbackFns[fnName]?.forEach(fn => {
                            fn?.(...args)
                        })
                    }
                })
                return _callbackFnProps;
            }
            return {}
        }, [Object.values(others)])

        // 元素属性，注意：直接值元素设置的属性值会覆盖使用engine.setState设置的元素值，
        // 如果想两种方式都生效，需要使用受控的模式进行更新属性
        const elementProps = Object.assign({}, state, { ...callbackFnProps })
        const previousProps = usePrevious(elementProps)
        const forceUpdate = useForceUpdate();
        useEffect(() => {
            if (elementId && engine?._watchFns[elementId]) {
                const watchFns = engine?._watchFns[elementId];
                Object.keys(watchFns).forEach(dep => {
                    if (get(elementProps, dep) !== get(previousProps, dep)) {
                        watchFns[dep]?.forEach(fn => fn?.())
                    }
                })
            }
        })
        useEffect(() => {
            if (engine && elementId) {
                engine._forceUpdate[elementId] = forceUpdate
                engine._didMountFns[elementId]?.forEach(fn => fn?.())
            }
            return () => {
                if (elementId && engine) {
                    delete engine._forceUpdate[elementId]
                    engine._willUnmountFns[elementId]?.forEach(fn => fn())
                }
            }
        }, [])
        const RenderUI = engine?._elements?.[elementId || ''] || UI
        // @ts-ignore
        return <RenderUI {...elementProps} data-element-id={elementId} children={props?.children as any} />
    })
}

function useForceUpdate() {
    const [_, forceUpdate] = useReducer(c => ++c, 0);
    return forceUpdate
}

function usePrevious<ValueType = any>(value: ValueType) {
    const ref = useRef<ValueType>()
    useEffect(() => { ref.current = value })
    return ref.current
}