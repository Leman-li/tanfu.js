import React, { useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { CoreEngine, TanfuView } from 'tanfu-core';
export { Engine, Plugin } from 'tanfu-core'
import get from 'lodash.get'
import reactDeclarations from './declarations';
import Tanfu from 'tanfu-core';
import { TemplateObject } from 'tanfu-core/es/html';
import { HOST_LIFECYCLE_ID, TANFU_COMPONENT } from 'tanfu-core/es/constants';
import { ComponentMetaData, InjectorObject } from 'tanfu-core';






export type ComponentArguments = Omit<Partial<InjectorObject>, 'declarations'> & {
    template: TemplateObject;
    declarations: Array<{ name: string, value: React.ComponentType<any> }>
}

export default class TanfuReactPlugin {
    install(tanfu: Tanfu) {
        tanfu.addDeclarations(reactDeclarations)

        tanfu.createRenderView = (view, props, type) => {
            let RenderUI;
            const reactProps: any = {}
            Object.keys(props ?? {}).forEach(key => {
                reactProps[formatToHump(key)] = props?.[key]
            })
            if (Tanfu.isTanfuView(view)) {
                let { view: ui, engine } = Tanfu.translateTanfuView(view, props)
                const ElementUI = createElement(function (props: any) {
                    return <ReactView props={props} engine={engine} children={ui} />
                })
                return <ElementUI {...reactProps} />
            }
            if (type === Node.TEXT_NODE) {
                return view
            } else if (type === Node.ELEMENT_NODE && view) {
                RenderUI = createElement(view)
                return <RenderUI {...reactProps} />
            }
            return <></>;
        }
    }
}


// @ts-ignore
const ReactViewContext = React.createContext<CoreEngine>(null);


interface ReactViewProps {
    children: React.ReactChild;
    engine: CoreEngine;
    props: Record<string, any>
}


/** 包裹React视图组件，生成CoreEngine并执行控制器 */
function ReactView({ children, engine, props }: ReactViewProps) {
    useMemo(() => {
        engine.willMountHook.call(HOST_LIFECYCLE_ID)
    }, [])

    useMemo(() => {
        engine.props = props
        engine.updateHook.call(HOST_LIFECYCLE_ID)
    }, [props])


    useEffect(() => {
        engine.didMountHook.call(HOST_LIFECYCLE_ID)
        return () => {
            engine.willUnmountHook.call(HOST_LIFECYCLE_ID)
        }
    }, [])
    return <ReactViewContext.Provider value={engine}>{children}</ReactViewContext.Provider>
}

type UIComponent<P> = React.NamedExoticComponent<React.ComponentProps<React.ComponentType<P>> & { tId?: string }>

type Element<P> = UIComponent<P>

/** 创建视图元素 */
function createElement<P = {}>(
    UI: React.ComponentType<P>,
): Element<P> {
    return React.memo(function (props: React.ComponentProps<typeof UI> & { tId?: string }) {
        const { tId: id, ...otherProps } = props
        const [tId] = useState(id || String(Date.now()))
        // 获取engine
        const engine = useContext(ReactViewContext)
        useMemo(() => { tId && engine && engine.willMountHook.call(tId) }, [tId])

        // 构建injectCallback生成的回调属性 
        const callbackFnProps = useMemo(() => {
            const callback: any = {}
            if (tId) {
                engine?.callbackHook.fork(tId).forEach((fnName) => {
                    callback[fnName] = (...args: any[]) => {
                        // @ts-ignore
                        otherProps?.[fnName]?.(...args)
                        engine.callbackHook.call([tId, fnName], ...args)
                    }
                })
            }
            return callback
        }, [otherProps])

        // 获取元素state
        const state = tId ? engine?.getState(tId) : {}

        // 元素属性，注意：直接值元素设置的属性值会覆盖使用engine.setState设置的元素值，
        // 如果想两种方式都生效，需要使用受控的模式进行更新属性
        const currentState = Object.assign({ ...otherProps }, state, { ...callbackFnProps })
        const preState = usePrevious(currentState)
        const forceUpdate = useForceUpdate();
        useEffect(() => {
            if (tId) {
                engine?.watchElementHook?.fork(tId).forEach((dep) => {
                    if (get(currentState, dep) !== get(preState, dep)) {
                        engine?.watchElementHook.call([tId, dep])
                    }
                })
            }
        })
        useEffect(() => {
            if (tId) {
                engine?.forceUpdateHook.on(tId, forceUpdate)
                engine?.didMountHook?.call(tId)
            }
            return () => {
                if (tId) {
                    engine?.forceUpdateHook.off(tId, forceUpdate)
                    engine?.willUnmountHook?.call(tId)
                }
            }
        }, [])
        // @ts-ignore
        return <UI {...currentState} />
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

// 字符串中间线转驼峰
const formatToHump = (value: string) => {
    return value.replace(/\-(\w)/g, (_, letter) => letter.toUpperCase())
}

// 字符串驼峰转中间线
const formatToLine = (value: string) => {
    return value.replace(/([A-Z])/g, '-$1').toLowerCase()
}