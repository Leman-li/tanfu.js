import get from "lodash.get"
import set from "lodash.set"

export type HookFunction = (...args: any[]) => void

export type BeforeIntercepor = (name: string | string[], ...args: any) => void
export type AfterInterceptor = (name: string | string[], ...args: any) => void

export interface Interceptor {
    before: Array<BeforeIntercepor>
    after: Array<AfterInterceptor>
}

export default class TanfuHook {
    private listeners: Record<string, Map<any, any>> = {}
    private onceListeners: Record<string, Map<any, any>> = {}
    private zone!: Zone

    readonly interceptor: Interceptor = {
        before: [],
        after: []
    }

    constructor(zone: Zone) {
        this.zone = zone
    }

    fork(name: string | string[]): TanfuHook {
        const hook = new TanfuHook(this.zone)
        hook.listeners = get(this.listeners, name, {})
        hook.onceListeners = get(this.onceListeners, name, {})
        return hook
    }

    isExist(name: string | string[]){
        return !!get(this.listeners, name)
    }

    forEach(fn: (name: string, value: any, once?: boolean) => void) {
        Object.keys(this.listeners).forEach(key => fn?.(key, this.listeners[key]))
        Object.keys(this.onceListeners).forEach(key => fn?.(key, this.onceListeners[key], true))
    }


    /** 注册 */
    on(name: string | string[], fn: HookFunction) {
        const map = get(this.listeners, name, new Map())
        if (!map.has(fn)) set(this.listeners, name, map.set(fn, fn))
    }

    /** 注册后只触发一次 */
    once(name: string | string[], fn: HookFunction) {
        const map = get(this.onceListeners, name, new Map())
        if (!map.has(fn)) set(this.onceListeners, name, map.set(fn, fn))
    }

    /** 移除 */
    off(name: string | string[], fn: HookFunction) {
        get(this.listeners, name, new Map()).delete(fn)
        get(this.onceListeners, name, new Map()).delete(fn)
    }

    /** 触发 */
    call(name: string[] | string, ...args: any[]) {

        const after = () => {
            this.interceptor.after.forEach(fn => fn(name, ...args))
        }

        const before = (...args: any) => {
            this.interceptor.before.forEach(fn => fn(name, ...args))
        }

        // @ts-ignore
        get(this.listeners, name)?.forEach(fn => {
            this.zone.run(() => {
                    before()
                    fn?.(...args)
                    after()
                    Promise.resolve().then(()=>{})
            })
        }
        )
        // @ts-ignore
        get(this.onceListeners, name)?.forEach((fn, _, map) => {
            this.zone.run(() => {
                    before()
                    fn?.(...args)
                    after()
                    map.delete(fn)
                    Promise.resolve().then(()=>{})
            })
        })
    }
}