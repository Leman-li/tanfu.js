import set from 'lodash.set';
import get from 'lodash.get'
import { assignExcludeFns } from './util';
import Plugin from './plugin';
type ElementId = string;
type DependenceKey = string;
type InJectCallBackName = string;
type WatchFn = () => void;
type InJectCallBackFn = (...args: any) => void;
type ForceUpdate = () => void;
type States = Record<ElementId, any>;


export interface Engine extends Pick<CoreEngine, 'setState' | 'getState' | 'watchElement' | 'injectCallback'> {

}



export default class CoreEngine {
    _watchFns: Record<ElementId, Record<DependenceKey, Array<WatchFn>>>
    _callBackFns: Record<ElementId, Record<InJectCallBackName, Array<InJectCallBackFn>>>
    _forceUpdate: Record<ElementId, ForceUpdate>
    _store: Record<string, any>
    _plugins: Map<string | Plugin, Plugin>
    constructor() {
        this._watchFns = {};
        this._callBackFns = {};
        this._forceUpdate = {};
        this._store = {};
        this._plugins = new Map()
    }

    toEngine(): Engine {
        return {
            watchElement: this.watchElement.bind(this),
            setState: this.setState.bind(this),
            injectCallback: this.injectCallback.bind(this),
            getState: this.getState.bind(this)
        }
    }

    /** 注册plugin */
    registerPlugin(plugins: Plugin[]) {
        plugins.forEach(plugin => {
            this._plugins.set(plugin.getName() || plugin, plugin)
        })
        this._plugins.forEach(plugin => {
            plugin.apply(this.toEngine())
        })
    }

    /** 设置状态 */
    setState(states: States) {
        Object.keys(states).forEach(elementId => {
            const preState = get(this._store, elementId);
            const state = assignExcludeFns(preState, states[elementId])
            set(this._store, elementId, state);
            // 精确更新
            this._forceUpdate[elementId]?.()
        })
    }

    /** 获取状态 */
    getState(elementId: string) {
        return get(this._store, elementId)
    }

    /** 监听元素属性变化 */
    watchElement(elementId: string, fn: () => void, deps: string[]) {
        if (!this._watchFns[elementId]) this._watchFns[elementId] = {}
        deps.forEach(dep => {
            if (!this._watchFns[elementId][dep]) this._watchFns[elementId][dep] = []
            this._watchFns[elementId][dep].push(fn)
        })
    }

    /** 插入回调 */
    injectCallback(elementId: string, fnName: string, fn: (...args: any) => void) {
        if (!this._callBackFns[elementId]) this._callBackFns[elementId] = {}
        if (!this._callBackFns[elementId][fnName]) this._callBackFns[elementId][fnName] = []
        this._callBackFns[elementId][fnName].push(fn)
    }
}