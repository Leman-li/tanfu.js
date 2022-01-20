import React, { useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { CoreEngine, Plugin } from 'tanfu-core';
export { Engine } from 'tanfu-core/es/engine';
export { default as Plugin } from 'tanfu-core/es/plugin'
import get from 'lodash.get'

// @ts-ignore
const ReactViewContext = React.createContext<CoreEngine>(null);

export function ReactView({ children, plugins = [] }: { children: React.ReactChild, plugins: Plugin[] }) {
    const engine = useMemo(() => {
        const engine = new CoreEngine();
        engine.registerPlugin(plugins);
        return engine;
    }, [])
    return <ReactViewContext.Provider value={engine}>{children}</ReactViewContext.Provider>
}

ReactView.displayName = '$REACT_VIEW$'

export function createContainer<P = {}>(plugins: any[], UI: React.ComponentType<P>) {
    return createElement(plugins, UI, ReactView)
}


function createElement<P = {}>(plugins: any[], UI: React.ComponentType<P>, ReactView: React.ComponentType<any> = React.Fragment) {
    const Element = React.memo(function (props: React.ComponentProps<typeof UI> & { elementId?: string }) {
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
        const reactViewProps: { plugins?: Plugin[] } = {};
        if (ReactView.displayName === '$REACT_VIEW$') reactViewProps['plugins'] = plugins
        return <ReactView {...reactViewProps}><RenderUI {...elementProps} /></ReactView>;
    })
    return Element;
}

export function createUI<P = {}>(UI: React.ComponentType<P>) {
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