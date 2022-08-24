import { HOST_LIFECYCLE_ID, TANFU_ENGINE, TANFU_EVENTLISTENER, TANFU_LIFECYCLE, TANFU_WATCHELEMENT } from "../constants";
import { EventListenerMetadata } from "../decorators/event-listener";
import { LifeCycleMetadata } from "../decorators/lifecycle";
import { WatchElementMetadata } from "../decorators/watch-element";
import IoCContainer, { Controllers, Providers } from "../ioc";
import CoreEventInject from "./core-event-inject";
import TanfuEngine from "./tanfu-engine";


export default class CoreMetadataInject<VM> extends CoreEventInject<VM> {
    public ioc!: IoCContainer;
    public props: Record<string, any> = {}

    constructor(providers: Providers, controllers: Controllers) {
        super()
        this.ioc = new IoCContainer([
            ...providers,
            {
                provide: TANFU_ENGINE, useValue: {
                    setState: this.setState.bind(this),
                    getState: this.getState.bind(this),
                    getProps: () => this.props
                } as TanfuEngine<VM>
            }
        ], controllers)
        controllers.forEach(Controller => {
            const controller = this.ioc.getController(Controller.name)
            const eMetadata: EventListenerMetadata = Reflect.getMetadata(TANFU_EVENTLISTENER, Controller.prototype)
            const wMetadata: WatchElementMetadata = Reflect.getMetadata(TANFU_WATCHELEMENT, Controller.prototype)
            const lMetadata: LifeCycleMetadata = Reflect.getMetadata(TANFU_LIFECYCLE, Controller.prototype)
            lMetadata && this.addLifeCycleMetaData(lMetadata, controller)
            eMetadata && this.addCallbackMetaData(eMetadata, controller)
            wMetadata && this.addWatchElementMetaData(wMetadata, controller)
        })
    }


    addLifeCycleMetaData(data: LifeCycleMetadata, controller: any) {
        Object.keys(data).forEach(tId => {
            // @ts-ignore
            Object.keys(data[tId]).forEach((name: LifeTimeName) => {
                // @ts-ignore
                data[tId][name]?.forEach(methodName => this[name]?.(tId, controller?.[methodName]?.bind?.(controller)))
            })
        })
    }


    addWatchElementMetaData(data: WatchElementMetadata, controller: any) {
        const _this = this
        Object.keys(data).forEach(tId => {
            Object.keys(data[tId]).forEach(propertyName => {
                // @ts-ignore
                Object.keys(data[tId][propertyName]).forEach(methodName => this.watchElement(tId, controller?.[methodName]?.bind?.(controller), [propertyName]))
            })
        })
    }

    addCallbackMetaData(data: EventListenerMetadata, controller: any) {
        const _this = this
        Object.keys(data).forEach(tId => {
            Object.keys(data[tId]).forEach(listenerName => {
                // @ts-ignore
                data[tId][listenerName].forEach(methodName => {
                    const fn: any = (...args: any[]) => {
                        const excuteFn = controller?.[methodName]?.bind?.(controller, ...args)
                        return excuteFn?.()
                    }
                    _this.injectCallback(tId as any, listenerName as any, fn)
                })
            })
        })
    }
}