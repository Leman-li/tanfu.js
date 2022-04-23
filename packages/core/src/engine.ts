import set from 'lodash.set';
import get from 'lodash.get';
import { produce } from 'immer'
import { EventListenerMetaData, LifeCycleMetaData, WatchElementMetaData } from './decorator';
import { injector, InjectorObject, ViewObject } from './injector';
import { TANFU_CONTROLLER_CHILDVIEW } from './constants';
import { TanfuView } from './view';

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

type WillMountFunction = DidMountFunction

// 定义元素卸载函数
type WillUnmountFunction = WatchFunction;

// 定义view model 类型
export type ViewModel = DeepPartial<{
    [elementId: string]: {
        [p: string]: any
    }
}>

export type DeepPartial<T> = {
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
export interface Engine<VM extends ViewModel = ViewModel> extends Pick<CoreEngine<VM>, 'setState' | 'getState'> {

}

/** 核心引擎 */
export default class CoreEngine<VM extends ViewModel = ViewModel> {
    _watchFns: Record<string, Record<DependencyProperty, Array<WatchFunction>>>
    _callBackFns: Record<string, Record<InJectCallBackName, Array<InJectCallBackFunction>>>
    _forceUpdate: Partial<Record<ElementId<VM>, ForceUpdate>>
    _store: Record<string, any>
    _controllers: Map<string, any>
    _providers: Map<string, any>
    _elements: Partial<Record<ElementId<VM>, any>>
    _declarateElements: Record<string, any>
    _didMountFns: Record<string, Array<DidMountFunction>>
    _willUnmountFns: Record<string, Array<WillUnmountFunction>>
    _willMountFns: Record<string, Array<DidMountFunction>>
    _parentEngine!: CoreEngine | null
    _subEngines!: CoreEngine | null;
    _views: Record<string, any>
    _hostView!: TanfuView
    constructor() {
        this._watchFns = {};
        this._callBackFns = {};
        this._forceUpdate = {};
        this._store = {};
        this._controllers = new Map();
        this._providers = new Map()
        this._elements = {}
        this._didMountFns = {}
        this._willUnmountFns = {}
        this._declarateElements = {}
        this._willMountFns = {}
        this._views = {}
    }

    /** 将视图添加到Controller */
    addViewToController() {
        this._controllers.forEach(controller => {
            const childViews = Reflect.getMetadata(TANFU_CONTROLLER_CHILDVIEW, controller.constructor.prototype)

            Object.keys(childViews).forEach(propertyName => {
                controller[propertyName] = this._views[childViews[propertyName]]
            });
        })
    }

    /** 添加主视图 */
    addHostView(view: ViewObject) {
        this._hostView = view.view;
        this._hostView['dispatchEvent'] = ({ type, payload }) => {
            const [elementId, callbackName] = type?.split('/') || []
            this._callBackFns[elementId]?.[callbackName]?.forEach(fn => fn(payload))
        }
        this._parentEngine?.addView(view)
    }

    addView(view: ViewObject) {
        if (view.elementId) this._views[view.elementId] = view.view
    }

    inject(object: InjectorObject) {
        // @ts-ignore
        injector(this, object)
    }

    /** 找到声明 */
    findDeclaration(name: string) {
        let engine = this, declaration;
        while (engine) {
            declaration = engine._declarateElements[name]
            if (declaration) return declaration
            // @ts-ignore
            engine = engine._parentEngines
        }
        return null
    }

    /** 寻找Provider */
    findProvider(name: string) {
        let engine = this, provider;
        while (engine) {
            provider = engine._providers?.get(name)
            if (provider) return provider
            // @ts-ignore
            engine = engine._parentEngines
        }
    }

    /** 添加父引擎 */
    addParentCoreEngine(engine: CoreEngine) {
        this._parentEngine = engine
    }

    toEngine(): Engine<VM> {
        return {
            setState: this.setState.bind(this),
            getState: this.getState.bind(this),
        }
    }

    /** 组件加载完成 */
    didMount(elementId: ElementId<VM>, fn: DidMountFunction) {
        (this._didMountFns[elementId] = this._didMountFns[elementId] ?? []).push(fn)
    }

    /** 组件加载完成 */
    willMount(elementId: ElementId<VM>, fn: WillMountFunction) {
        (this._willMountFns[elementId] = this._willMountFns[elementId] ?? []).push(fn)
    }


    /** 组件卸载完成 */
    willUnmount(elementId: ElementId<VM>, fn: WillUnmountFunction) {
        (this._willUnmountFns[elementId] = this._willUnmountFns[elementId] ?? []).push(fn)
    }

    addLifeCycleMetaData(data: LifeCycleMetaData, controller: any) {
        Object.keys(data).forEach(elementId => {
            // @ts-ignore
            Object.keys(data[elementId]).forEach((name: LifeTimeName) => {
                // @ts-ignore
                data[elementId][name]?.forEach(methodName => this[name]?.(elementId, controller?.[methodName]?.bind?.(controller)))
            })
        })
    }

    /** 注册组件 */
    registerElements(elements: Record<string, any>) {
        this._elements = Object.assign({}, this._elements, elements)
    }

    /** 设置状态 */
    setState(states: SetStatesAction<VM>, needUpdate = true): void {
        if (typeof states === 'function') {
            return this.setState(states(this._store))
        }
        Object.keys(states).forEach(elementId => {
            const preState: Record<string, any> = get(this._store, elementId, {});
            const currentState: Record<string, any> = states[elementId] ?? {}
            const nextState = produce(preState, draft => {
                Object.keys(currentState).forEach(propName => {
                    if (typeof currentState[propName] !== 'function' && currentState[propName] !== draft[propName])
                        draft[propName] = currentState[propName]
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
        this._watchFns[elementId] = this._watchFns[elementId] ?? {}
        deps?.forEach(dep => {
            (this._watchFns[elementId][dep] = this._watchFns[elementId][dep] ?? []).push(fn)
        })
    }

    addWatchElementMetaData(data: WatchElementMetaData, controller: any) {
        const _this = this
        Object.keys(data).forEach(elementId => {
            Object.keys(data[elementId]).forEach(propertyName => {
                // @ts-ignore
                Object.keys(data[elementId][propertyName]).forEach(methodName => this.watchElement(elementId, controller?.[methodName]?.bind?.(controller), [propertyName]))
            })
        })
    }

    addCallbackMetaData(data: EventListenerMetaData, controller: any) {
        const _this = this
        Object.keys(data).forEach(elementId => {
            Object.keys(data[elementId]).forEach(listenerName => {
                // @ts-ignore
                data[elementId][listenerName].forEach(methodName =>{
                    const fn = controller?.[methodName]?.bind?.(controller)
                    _this.injectCallback(elementId as any, listenerName as any, fn)
                })
            })
        })
    }

    /** 插入回调 */
    injectCallback<E extends ElementId<VM>, F extends StringKeys<keyof PickFunction<VM[E]>>>(elementId: E, fnName: F, fn: VM[E][F]) {
        this._callBackFns[elementId] = this._callBackFns[elementId] ?? {};
        (this._callBackFns[elementId][fnName] = this._callBackFns[elementId][fnName] ?? []).push(<any>fn)
    }
}