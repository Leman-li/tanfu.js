import TanfuHook from "../tanfu-hook";
import { ElementId, PickNotFunction, SetStatesAction } from "./types";
import get from 'lodash.get'
import set from 'lodash.set'
import { produce } from 'immer'

let ignore_update_flag = false;

/** 
 * 忽略更新
 * 使用： ignoreUpdate(()=>{
 *   engine.setState({
 *      elementId: {
 *         a: 1
 *        }
 *    })
 * })
 *  */
export function ignoreUpdate(fn: () => void) {
    ignore_update_flag = true;
    fn()
    ignore_update_flag = false;
}

export default class CoreUpdateState<VM> {
    public zone: Zone = Zone.current.fork({
        name: String(Date.now()),
        properties: {
            engine: this,
        },
        onInvokeTask: (delegate, currentZone, targetZone, task, ...args) => {
            if (this.zone === currentZone) {
                delegate.invokeTask(targetZone, task, ...args)
                this.notifyUpdate()
            }
        },
    });
    private readonly store: Record<string, any> = {}
    public forceUpdateHook!: TanfuHook
    public setStateHook = new TanfuHook(this.zone)
    private readonly needUpdateElements: Set<string> = new Set();

    constructor() {
        this.forceUpdateHook = new TanfuHook(this.zone)
    }

    /** 设置状态 */
    setState(states: SetStatesAction<VM>): void {
        if (typeof states === 'function') {
            return this.setState(states(this.store))
        }
        this.setStateHook.interceptor.before.forEach(fn => fn('', states))
        Object.keys(states).forEach(tId => {
            const preState: Record<string, any> = get(this.store, tId, {});
            // @ts-ignore
            const currentState: Record<string, any> = states[tId] ?? {}
            const nextState = produce(preState, draft => {
                Object.keys(currentState).forEach(propName => {
                    if (typeof currentState[propName] !== 'function' && currentState[propName] !== draft[propName])
                        draft[propName] = currentState[propName]
                })
            })
            if (preState === nextState) return;
            if (!ignore_update_flag) this.needUpdateElements.add(tId)
            set(this.store, tId, nextState);
        })
        this.setStateHook.interceptor.after.forEach(fn => fn('', states))
    }

    /** 获取状态 */
    getState<E extends ElementId<VM>>(tId: E): PickNotFunction<VM[E]> {
        return get(this.store, tId, {})
    }

    // 统一更新
    notifyUpdate() {
        Array.from(this.needUpdateElements).forEach(tId => {
            this.forceUpdateHook.call(tId)
        })
        this.needUpdateElements.clear()
    }

}