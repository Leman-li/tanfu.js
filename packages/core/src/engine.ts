import set from 'lodash.set';
import get from 'lodash.get';
import { produce } from 'immer'
import Controller from './controller';

// 定义元素id类型
type ElementId<VM extends ViewModel = ViewModel> = StringKeys<keyof VM>;

type StringKeys<T> = T extends string ? T : never;

// 定义依赖的属性
type DependencyProperty = string;

// 定义注入回调函数的名称
type InJectCallBackName = string;

// 定义属性值改变回调函数
type WatchFunction = () => void;

// 定义注入回调函数类型
type InJectCallBackFunction = (...args: any) => void;

// 定义强制更新函数
type ForceUpdate = () => void;

type SetStateAction<S> = S | ((prevState: S) => S);

// 定义更新状态
type SetStatesAction<VM extends ViewModel> = SetStateAction<DeepPartial<{
    [K in keyof VM]: PickNotFunction<VM[K]>
}>>

// 定义元素加载完成函数
type DidMountFunction = WatchFunction;

// 定义元素卸载函数
type WillUnmountFunction = WatchFunction;

// 定义view model 类型
export type ViewModel = DeepPartial<{
    [elementId: string]: {
        [p: string]: any
    }
}>

type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

// 选择一个对象中的函数
type PickFunction<T> = {
    [K in keyof T as (T[K] extends (Function | undefined) ? K : never)]: T[K]
}

// 选择一个对象中的非函数内容
type PickNotFunction<T> = {
    [K in keyof T as (T[K] extends (Function | undefined) ? never : K)]: T[K]
}

/** 暴露给控制器 */
export interface Engine<VM extends ViewModel = ViewModel> extends Pick<CoreEngine<VM>, 'setState' | 'getState' | 'watchElement' | 'injectCallback' | 'didMount' | 'willUnmount'> {

}

/** 核心引擎 */
export default class CoreEngine<VM extends ViewModel = ViewModel> {
    _watchFns: Record<string, Record<DependencyProperty, Array<WatchFunction>>>
    _callBackFns: Record<string, Record<InJectCallBackName, Array<InJectCallBackFunction>>>
    _forceUpdate: Partial<Record<ElementId<VM>, ForceUpdate>>
    _store: Record<string, any>
    _controllers: Map<string | Controller, Controller>
    _elements: Partial<Record<ElementId<VM>, any>>
    _didMountFns: Record<string, Array<DidMountFunction>>
    _willUnmountFns: Record<string, Array<WillUnmountFunction>>
    constructor() {
        this._watchFns = {};
        this._callBackFns = {};
        this._forceUpdate = {};
        this._store = {};
        this._controllers = new Map();
        this._elements = {}
        this._didMountFns = {}
        this._willUnmountFns = {}
    }

    toEngine(): Engine<VM> {
        return {
            watchElement: this.watchElement.bind(this),
            setState: this.setState.bind(this),
            injectCallback: this.injectCallback.bind(this),
            getState: this.getState.bind(this),
            didMount: this.didMount.bind(this),
            willUnmount: this.willUnmount.bind(this)
        }
    }

    /** 组件加载完成 */
    didMount(elementId: ElementId<VM>, fn: DidMountFunction) {
        if (!this._didMountFns[elementId]) this._didMountFns[elementId] = [];
        this._didMountFns[elementId].push(fn)
    }

    /** 组件卸载完成 */
    willUnmount(elementId: ElementId<VM>, fn: WillUnmountFunction) {
        if (!this._willUnmountFns[elementId]) this._willUnmountFns[elementId] = [];
        this._willUnmountFns[elementId].push(fn)
    }

    /** 注册组件 */
    registerElements(elements: Record<string, any>) {
        this._elements = Object.assign({}, this._elements, elements)
    }

    /** 使用controller */
    useControllers(controllers: Controller[]) {
        controllers.forEach(controller => {
            this._controllers.set(controller.getName() || controller, controller)
        })
        this._controllers.forEach(controller => {
            controller.engine = this.toEngine()
            controller.apply(controller.engine, controller)
        })
    }

    /** 设置状态 */
    setState(states: SetStatesAction<VM>, needUpdate = true) {
        if (typeof states === 'function') {
            this.setState(states(this._store))
            return;
        }
        Object.keys(states).forEach(elementId => {
            const preState: Record<string, any> = get(this._store, elementId, {});
            const nextState = produce(preState, draft => {
                // @ts-ignore
                Object.keys(states[elementId]).forEach(propName => {
                    // @ts-ignore
                    if (typeof states[elementId][propName] !== 'function' && draft[propName] !== states[elementId][propName])
                        // @ts-ignore
                        draft[propName] = states[elementId][propName]
                })
            })
            if (preState === nextState) return;
            set(this._store, elementId, nextState);
            // 精确更新
            needUpdate && this._forceUpdate[elementId]?.()
        })
    }

    /** 获取状态 */
    getState<E extends ElementId<VM>>(elementId: E): PickNotFunction<VM[E]> {
        return get(this._store, elementId, {})
    }

    /** 监听元素属性变化 */
    watchElement<E extends ElementId<VM>>(elementId: E, fn: WatchFunction, deps: StringKeys<keyof PickNotFunction<VM[E]>>[]) {
        if (!this._watchFns[elementId]) this._watchFns[elementId] = {}
        deps?.forEach(dep => {
            if (!this._watchFns[elementId][dep]) this._watchFns[elementId][dep] = []
            this._watchFns[elementId][dep].push(fn)
        })
    }

    /** 插入回调 */
    injectCallback<E extends ElementId<VM>, F extends StringKeys<keyof PickFunction<VM[E]>>>(elementId: E, fnName: F, fn: VM[E][F]) {
        if (!this._callBackFns[elementId]) this._callBackFns[elementId] = {}
        if (!this._callBackFns[elementId][fnName]) this._callBackFns[elementId][fnName] = []
        // @ts-ignore
        this._callBackFns[elementId][fnName].push(fn)
    }
}