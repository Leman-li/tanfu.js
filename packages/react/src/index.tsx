import React, { useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import get from 'lodash.get'
import reactDeclarations from './declarations'
import Tanfu, { CoreEngine, TanfuAdapter, TanfuPlugin } from 'tanfu-core';
import { HOST_LIFECYCLE_ID, INNER_DIRECTIVES, HOST_T_ID } from 'tanfu-core/es/constants'
import { nanoid } from 'nanoid';
import { HideDirective, ModelDirective } from './directives';


class TanfuReactAdapter extends TanfuAdapter {
    createRenderView(view: any, props: any, type: number, engine?: CoreEngine) {
        const tId = props?.['t-id']
        if (tId) props['tId'] = tId;
        delete props?.['t-id']
        const reactProps: any = {}
        Object.keys(props ?? {}).forEach(key => {
            let newKey = '';
            if (key === 'class') newKey = 'className'
            else newKey = formatToHump(key)
            const descriptor = Object.getOwnPropertyDescriptor(props, key);
            if (descriptor) Object.defineProperty(reactProps, newKey, descriptor)
        })
        let RenderUI = view;
        if (Tanfu.isTanfuView(view)) {
            RenderUI = function (props: any) {
                const { view: ui, engine: tanfuEngine } = useMemo(() => Tanfu.translateTanfuView(view, props), [])
                return <ReactView props={props} engine={tanfuEngine} children={ui} />
            }
            if (tId) RenderUI = createElement(RenderUI, engine)
            return <RenderUI key={nanoid()} {...reactProps} />
        }
        if (type === Node.TEXT_NODE) {
            return view
        } else if (type === Node.ELEMENT_NODE && view) {
            if (tId) RenderUI = createElement(view, engine)
            return <RenderUI key={nanoid()} {...reactProps} />
        }
        return <React.Fragment key={nanoid()}></React.Fragment>;
    }
}



export default class TanfuReactPlugin extends TanfuPlugin {
    install(tanfu: Tanfu) {
        tanfu.addDeclarations(reactDeclarations)
        tanfu.addAdapter(new TanfuReactAdapter())
        tanfu.directive('hide', new HideDirective())
        tanfu.directive('model', new ModelDirective())
    }
}

interface ReactViewProps {
    children: React.ReactChild;
    engine: CoreEngine;
    props: Record<string, any>
}


/** 包裹React视图组件，生成CoreEngine并执行控制器 */
function ReactView({ children, engine, props }: ReactViewProps) {
    useMemo(() => {
        engine.props = props
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

    const preProps = usePrevious(props)
    useEffect(() => {
        engine.watchElementHook.fork(HOST_T_ID).forEach((dep) => {
            if (get(props, dep) !== get(preProps, dep)) {
                engine?.watchElementHook.call([HOST_T_ID, dep])
            }
        })
    })
    return <>{children}</>
}

type UIComponent<P> = React.NamedExoticComponent<React.ComponentProps<React.ComponentType<P>> & { tId?: string }>

type Element<P> = UIComponent<P>

/** 创建视图元素 */
function createElement<P = {}>(
    UI: React.ComponentType<P>,
    engine?: CoreEngine,
): Element<P> {
    return React.memo(function (props?: React.ComponentProps<typeof UI> & { tId?: string }) {
        // @ts-ignore
        const { tId: id, [INNER_DIRECTIVES]: innerDirectives, ...otherProps } = props ?? {}
        const [tId] = useState(id || String(Date.now()))
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
        const ref = useRef(null)
        useEffect(() => {
            if (tId) {
                engine?.forceUpdateHook.on(tId, forceUpdate)
                engine?.didMountHook?.call(tId, ref.current)
            }
            return () => {
                if (tId) {
                    engine?.forceUpdateHook.off(tId, forceUpdate)
                    engine?.willUnmountHook?.call(tId)
                }
            }
        }, [])
        // @ts-ignore
        if (props?.[INNER_DIRECTIVES]?.hidden) return null;
        // @ts-ignore
        if (UI.$$typeof?.toString() === 'Symbol(react.forward_ref)') currentState.ref = ref
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