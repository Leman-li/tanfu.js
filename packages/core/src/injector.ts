import { DESIGN_PARAMTERS, DESIGN_PARAMTYPES, TANFU_CONTROLLER, TANFU_CONTROLLER_CHILDVIEW, TANFU_EVENTLISTENER, TANFU_INJECT, TANFU_INJECTABLE, TANFU_INJECTABLE_NAME, TANFU_LIFECYCLE, TANFU_WATCHELEMENT } from "./constants";
import { ChildViewMetaData, EventListenerMetaData, LifeCycleMetaData, WatchElementMetaData } from "./decorator";
import CoreEngine from "./engine";
import { Type } from "./types";
import { TanfuView } from "./view";

export interface InjectorObject {
    providers: Array<Type<any> | { provide: Type<any> | string, useClass: Type<any> }>
    controllers: Type<any>[],
    declarations: Array<{ name: string, value: any }>
}

export interface ViewObject {
    view: TanfuView
    elementId?: string
}

export function injector(engine: CoreEngine, object: InjectorObject) {
    const { providers = [], controllers = [], declarations } = object
    // 注入声明
    declarations?.forEach(({ name, value }) => {
        engine._declarateElements[name] = value
    })
    providers.forEach(Provider => {
        const name = typeof Provider === 'object' ? typeof Provider.provide === 'string' ? Provider.provide : Provider.provide.name : Provider.name
        const InjectProvider = typeof Provider === 'object' ? Provider.useClass : Provider
        const isInjectable = Reflect.getMetadata(TANFU_INJECTABLE, InjectProvider)
        if (isInjectable && !engine._providers.has(name)) {
            engine._providers.set(name, new InjectProvider())
        }
    })
    controllers.forEach(Controller => {
        const isController = Reflect.getMetadata(TANFU_CONTROLLER, Controller)
        if (isController && !engine._controllers.has(Controller.name)) {
            const parameterTypes = Reflect.getMetadata(DESIGN_PARAMTYPES, Controller)
            const parameters: string[] = Reflect.getMetadata(DESIGN_PARAMTERS, Controller) ?? []
            const injectParameters = Reflect.getMetadata(TANFU_INJECT, Controller.prototype) ?? {}
            const controller = new Controller();

            [...parameters, ...Object.keys(injectParameters)].forEach((name, index) => {
                let value;
                if (injectParameters[name]) {
                    value = engine.findProvider(injectParameters[name])
                } else if (parameterTypes?.[index]) {
                    const ClassType: Type<any> = parameterTypes[index]
                    value = new ClassType()
                }
                if (name === 'engine') value = engine.toEngine()
                controller[name] = value
            })
            engine._controllers.set(Controller.name, controller)
            const eventListenerMetadata: EventListenerMetaData = Reflect.getMetadata(TANFU_EVENTLISTENER, Controller.prototype)
            const watchElementMetadata: WatchElementMetaData = Reflect.getMetadata(TANFU_WATCHELEMENT, Controller.prototype)
            const lifeTimeMetaData: LifeCycleMetaData = Reflect.getMetadata(TANFU_LIFECYCLE, Controller.prototype)
            lifeTimeMetaData && engine.addLifeCycleMetaData(lifeTimeMetaData, controller)
            eventListenerMetadata && engine.addCallbackMetaData(eventListenerMetadata, controller)
            watchElementMetadata && engine.addWatchElementMetaData(watchElementMetadata, controller)
        }
    })
}