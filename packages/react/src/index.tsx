export { default as Foo } from './Foo';

import React, { useContext, useEffect, useMemo, useReducer } from 'react';
import { Engine } from 'tanfu-core';
import { ReactViewEngine } from './Foo/plugin';

// @ts-ignore
const ReactViewContext = React.createContext<Engine>({});

export function ReactView({ children }: { children: React.ReactChild }) {
    const engine = useMemo(() => new ReactViewEngine(), [])
    return <ReactViewContext.Provider value={engine}>{children}</ReactViewContext.Provider>
}

export function createContainer<P = {}>(plugins: any[], UI: React.ComponentType<P>) {
    return createInner(plugins, UI, ReactView)
}


export function createInner<P = {}>(plugins: any[], UI: React.ComponentType<P>, ReactView: React.ComponentType<any> = React.Fragment) {
    return function (props: React.ComponentProps<typeof UI> & { elementId?: string }) {
        const { elementId, ...others } = props
        const engine = useContext(ReactViewContext)
        const state = elementId ? engine.getState(elementId) : {}
        const elementProps = Object.assign({}, others, state)
        const forceUpdate = useForceUpdate();
        useEffect(() => {
            if (elementId) engine._forceUpdate[elementId] = forceUpdate
            return () => {
                if (elementId) delete engine._forceUpdate[elementId]
            }
        }, [])
        return <ReactView><UI {...elementProps} /></ReactView>;
    }
}

export function createUI<P = {}>(UI: React.ComponentType<P>) {
    return createInner([], UI)
}
function useForceUpdate() {
    const [_, forceUpdate] = useReducer(c => ++c, 0);
    return forceUpdate
}