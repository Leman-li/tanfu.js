import React, { useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import TanfuCore, { CoreEngine, Controller, GLOBAL_ELEMENTS_KEY } from 'tanfu-core';
export { Controller, Engine, Plugin } from 'tanfu-core'
import get from 'lodash.get'

const Tanfu: Tanfu = TanfuCore
// 重写element方法，使用createUI包裹
Tanfu.element = function (elementId: string, ui: React.ComponentType<any>) {
    const Element = createUI(ui);
    // Element.displayName = elementId
    // @ts-ignore
    Tanfu[GLOBAL_ELEMENTS_KEY][elementId] = createUI(ui)
}

export type Tanfu = Omit<typeof TanfuCore, 'element'> & {
    element: (elementId: string, ui: React.ComponentType<any>) => void
}

export default Tanfu;


// @ts-ignore
const ReactViewContext = React.createContext<CoreEngine>(null);

/** 如果注册了全局组件可用这个进行渲染 ，默认渲染children */
export function Template(props: { elementId: string, children?: React.ReactChild }) {
    const { elementId, children } = props
    // @ts-ignore
    const RenderUI = TanfuCore[GLOBAL_ELEMENTS_KEY][elementId]
    return <>{RenderUI ? <RenderUI elementId={elementId} /> : children}</>
}

interface ReactViewProps {
    children: React.ReactChild;
    controllers?: Controller[];
    elements?: Record<string, React.ComponentType<any>>;
}

/** 包裹React视图组件，生成CoreEngine并执行控制器 */
export function ReactView({ children, controllers = [], elements = {} }: ReactViewProps) {
    const engine = useMemo(() => {
        const engine = new CoreEngine();
        engine.useControllers(controllers);
        engine.registerElements(elements)
        return engine;
    }, [])
    return <ReactViewContext.Provider value={engine}>{children}</ReactViewContext.Provider>
}

ReactView.displayName = '$REACT_VIEW$'

/** 创建容器组件 */
export function createContainer<P = {}>(UI: React.ComponentType<P>, controllers: Controller[] = []): ContainerComponent<P> {
    return createElement(controllers, UI, ReactView);
}

type ContainerComponent<P> = Element<P>

type UIComponent<P> = React.NamedExoticComponent<React.ComponentProps<React.ComponentType<P>> & { elementId?: string }>

type Element<P> = UIComponent<P> & {
    /** 扩展UI */
    extend<VM extends Record<string, any>>(args: { elements?: { [K in keyof VM]?: React.ComponentType<VM[K]> }, controllers?: Controller[] }): Element<P>
}

/** 创建视图元素 */
function createElement<P = {}>(
    controllers: Controller[],
    UI: React.ComponentType<P>,
    ReactView: React.ComponentType<any> = React.Fragment,
    elements?: ReactViewProps['elements']
): Element<P> {
    const Element = React.memo(function (props: React.ComponentProps<typeof UI> & { elementId?: string }) {
        const { elementId, ...others } = props
        // 获取engien
        const engine = useContext(ReactViewContext)
        // 获取元素state
        const state = elementId ? engine?.getState(elementId) : {}

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
        }, [others])

        // 元素属性，注意：直接值元素设置的属性值会覆盖使用engine.setState设置的元素值，
        // 如果想两种方式都生效，需要使用受控的模式进行更新属性
        const elementProps = Object.assign({}, state, { elementId, ...others, ...callbackFnProps })
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
        RenderUI.displayName = elementId
        // @ts-ignore
        const reactViewProps: ReactViewProps = {};
        if (ReactView.displayName === '$REACT_VIEW$') {
            reactViewProps['controllers'] = controllers
            reactViewProps['elements'] = elements
        }
        return <ReactView {...reactViewProps}><RenderUI {...elementProps} /></ReactView>;
    })
    const ReturnElement = Element as Element<P>;
    ReturnElement.extend = function ({ elements = {}, controllers: extendControllers = [] }) {
        // @ts-ignore
        return createElement([...controllers, ...extendControllers], UI, ReactView, elements)
    }
    let displayNamePrefix = 'Element_UI'
    if (ReactView.displayName === '$REACT_VIEW$') {
        displayNamePrefix = 'Container_UI'
    }
    ReturnElement.displayName = displayNamePrefix
    return ReturnElement;
}

/** 创建UI组件 */
export function createUI<P = {}>(UI: React.ComponentType<P>): UIComponent<P> {
    return createElement([], UI)
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