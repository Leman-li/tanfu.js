import React, { useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { CoreEngine } from 'tanfu-core';
import get from 'lodash.get'

// @ts-ignore
const ReactViewContext = React.createContext<CoreEngine>({});

export function ReactView({ children }: { children: React.ReactChild }) {
    const engine = useMemo(() => new CoreEngine(), [])
    return <ReactViewContext.Provider value={engine}>{children}</ReactViewContext.Provider>
}

export function createContainer<P = {}>(plugins: any[], UI: React.ComponentType<P>) {
    return createInner(plugins, UI, ReactView)
}


function createInner<P = {}>(plugins: any[], UI: React.ComponentType<P>, ReactView: React.ComponentType<any> = React.Fragment) {
    return React.memo(function (props: React.ComponentProps<typeof UI> & { elementId?: string }) {
        const { elementId, ...others } = props
        const engine = useContext(ReactViewContext)
        const state = elementId ? engine?.getState(elementId) : {}

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
        }, [])

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
            if (engine) {
                engine.registerPlugin(plugins);
                if (elementId) {
                    engine._forceUpdate[elementId] = forceUpdate
                }
            }
            return () => {
                if (elementId && engine) delete engine._forceUpdate[elementId]
            }
        }, [])
        return <ReactView><UI {...elementProps} /></ReactView>;
    })
}

export function createUI<P = {}>(UI: React.ComponentType<P>) {
    return createInner([], UI)
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