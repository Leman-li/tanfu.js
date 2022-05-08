import set from 'lodash.set';
import get from 'lodash.get';
import { produce } from 'immer'
import { Controller, EventListenerMetaData, LifeCycleMetaData, WatchElementMetaData } from './decorator';
import { InjectorObject, ViewObject } from './ioc';
import { HOST_LIFECYCLE_ID, TANFU_CHILD_VIEW, TANFU_EVENTLISTENER, TANFU_LIFECYCLE, TANFU_WATCHELEMENT } from './constants';
import { TanfuView } from './view';
import IoCContainer from './ioc';
import TanfuHook from './tanfu-hook';

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


type UpdateFunction = WatchFunction

// 定义view model 类型
export type ViewModel = DeepPartial<{
    [tId: string]: {
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
    getProps: () => Record<string, any>
}

/** 核心引擎 */
export default class CoreEngine<VM extends ViewModel = ViewModel> {
    readonly zone: Zone = Zone.current.fork({
        name: String(Date.now()),
        properties: {
            engine: this,
        },
        onInvokeTask: (delegate, currentZone, targetZone, task, ...args) => {
            console.log('任务执行')
            delegate.invokeTask(targetZone, task, ...args)
            this.notifyUpdate()
        },
    })
    public watchElementHook: TanfuHook = new TanfuHook(this.zone)
    public callbackHook: TanfuHook = new TanfuHook(this.zone)
    public forceUpdateHook: TanfuHook = new TanfuHook(this.zone)
    private readonly store: Record<string, any> = {}
    private readonly elements: Partial<Record<ElementId<VM>, any>> = {}
    private readonly declarations: Map<string, any> = new Map()
    public didMountHook: TanfuHook = new TanfuHook(this.zone)
    public updateHook: TanfuHook = new TanfuHook(this.zone)
    public willUnmountHook: TanfuHook = new TanfuHook(this.zone)
    public willMountHook: TanfuHook = new TanfuHook(this.zone)
    private readonly parentEngine!: CoreEngine | null | undefined
    private readonly subEngines!: CoreEngine | null;
    private readonly childViews = new Map<string, any>();
    private hostView!: TanfuView;
    private ioc!: IoCContainer;
    private readonly needUpdateElements: Set<string> = new Set();
    public props: Record<string, any> = {}

    constructor(parentEngine: CoreEngine, providers: InjectorObject['providers'], controllers: InjectorObject['controllers'], view: ViewObject) {
        this.parentEngine = parentEngine
        this.addHostView(view)
        this.ioc = new IoCContainer([
            ...providers,
            { provide: 'engine', useValue: this.toEngine() }
        ], controllers)
        controllers.forEach(Controller => {
            const controller = this.ioc.getController(Controller.name)
            const eventListenerMetadata: EventListenerMetaData = Reflect.getMetadata(TANFU_EVENTLISTENER, Controller.prototype)
            const watchElementMetadata: WatchElementMetaData = Reflect.getMetadata(TANFU_WATCHELEMENT, Controller.prototype)
            const lifeTimeMetaData: LifeCycleMetaData = Reflect.getMetadata(TANFU_LIFECYCLE, Controller.prototype)
            lifeTimeMetaData && this.addLifeCycleMetaData(lifeTimeMetaData, controller)
            eventListenerMetadata && this.addCallbackMetaData(eventListenerMetadata, controller)
            watchElementMetadata && this.addWatchElementMetaData(watchElementMetadata, controller)
        })
        this.didMountHook.interceptor.before.push((name) => {
            if (name === HOST_LIFECYCLE_ID) {
                controllers.forEach(Controller => {
                    let providers: InjectorObject['providers'] = [];
                    this.childViews.forEach((view, tId) => {
                        providers.push({
                            provide: TANFU_CHILD_VIEW + tId,
                            useValue: view
                        })
                    })
                    this.ioc.inject(this.ioc.getController(Controller.name), providers)
                })
            }
        })
    }

    /** 添加声明 */
    addDeclarations(declarations: InjectorObject['declarations']) {
        declarations.forEach(({ name, value }) => {
            this.declarations.set(name, value)
        })
    }

    /** 添加主视图 */
    private addHostView(viewObject: ViewObject) {
        const { view } = viewObject
        this.hostView = view;
        this.hostView['dispatchEvent'] = ({ type, payload }) => {
            const [tId, callbackName] = type?.split('/') || []
            this.callbackHook.call([tId, callbackName], payload)
        }
        this.parentEngine?.addChildView(viewObject)
    }

    private addChildView(viewObject: ViewObject) {
        const { tId, view } = viewObject
        if (tId) this.childViews.set(tId, view)
    }

    /** 找到声明 */
    getDeclaration(name: string): any {
        return this.declarations.get(name) ?? this.parentEngine?.getDeclaration(name)
    }

    toEngine(): Engine<VM> {
        return {
            setState: this.setState.bind(this),
            getState: this.getState.bind(this),
            getProps: () => this.props
        }
    }

    /** 组件加载完成 */
    didMount(tId: ElementId<VM>, fn: DidMountFunction) {
        this.didMountHook.on(tId, fn)
    }

    update(tId: ElementId<VM>, fn: UpdateFunction) {
        this.updateHook.on(tId, fn)
    }

    /** 组件加载完成 */
    willMount(tId: ElementId<VM>, fn: WillMountFunction) {
        this.willMountHook.on(tId, fn)
    }

    // 统一更新
    notifyUpdate() {
        Array.from(this.needUpdateElements).forEach(tId => {
            this.forceUpdateHook.call(tId)
        })
        this.needUpdateElements.clear()
    }


    addLifeCycleMetaData(data: LifeCycleMetaData, controller: any) {
        Object.keys(data).forEach(tId => {
            // @ts-ignore
            Object.keys(data[tId]).forEach((name: LifeTimeName) => {
                // @ts-ignore
                data[tId][name]?.forEach(methodName => this[name]?.(tId, controller?.[methodName]?.bind?.(controller)))
            })
        })
    }

    /** 设置状态 */
    setState(states: SetStatesAction<VM>): void {
        if (typeof states === 'function') {
            return this.setState(states(this.store))
        }
        Object.keys(states).forEach(tId => {
            const preState: Record<string, any> = get(this.store, tId, {});
            const currentState: Record<string, any> = states[tId] ?? {}
            const nextState = produce(preState, draft => {
                Object.keys(currentState).forEach(propName => {
                    if (typeof currentState[propName] !== 'function' && currentState[propName] !== draft[propName])
                        draft[propName] = currentState[propName]
                })
            })
            if (preState === nextState) return;
            this.needUpdateElements.add(tId)
            set(this.store, tId, nextState);
        })
    }

    /** 获取状态 */
    getState<E extends ElementId<VM>>(tId: E): PickNotFunction<VM[E]> {
        return get(this.store, tId, {})
    }

    /** 监听元素属性变化 */
    watchElement<E extends ElementId<VM>>(tId: E, fn: WatchFunction, deps: StringKeys<keyof PickNotFunction<VM[E]>>[]) {
        deps?.forEach(dep => {
            this.watchElementHook.on([tId, dep], fn)
        })
    }

    addWatchElementMetaData(data: WatchElementMetaData, controller: any) {
        const _this = this
        Object.keys(data).forEach(tId => {
            Object.keys(data[tId]).forEach(propertyName => {
                // @ts-ignore
                Object.keys(data[tId][propertyName]).forEach(methodName => this.watchElement(tId, controller?.[methodName]?.bind?.(controller), [propertyName]))
            })
        })
    }

    addCallbackMetaData(data: EventListenerMetaData, controller: any) {
        const _this = this
        Object.keys(data).forEach(tId => {
            Object.keys(data[tId]).forEach(listenerName => {
                // @ts-ignore
                data[tId][listenerName].forEach(methodName => {
                    const fn = controller?.[methodName]?.bind?.(controller)
                    _this.injectCallback(tId as any, listenerName as any, fn)
                })
            })
        })
    }

    /** 插入回调 */
    injectCallback<E extends ElementId<VM>, F extends StringKeys<keyof PickFunction<VM[E]>>>(tId: E, fnName: F, fn: VM[E][F]) {
        this.callbackHook.on([tId, fnName], fn as any)
    }
}