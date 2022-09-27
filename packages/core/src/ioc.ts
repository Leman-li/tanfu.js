
import { DESIGN_PARAMTERS, DESIGN_PARAMTYPES, TANFU_EVENTLISTENER, TANFU_INJECT, TANFU_INJECTABLE_WATER_MARK, TANFU_WATCHELEMENT } from "./constants";
import { InjectMetadata } from "./decorators/inject";
import { Type } from "./types";
import TanfuView from "./view";


type ValueProvider = { provide: string, useValue: any }

type ClassProviders = Type<any> | {provide: Type<any> | string, useClass: Type<any>}

export type Providers = Array<ValueProvider | ClassProviders>
export type Controllers = Type<any> []
export type Declarations = Record<string, any>



export interface ViewObject {
    view: TanfuView
    tId?: string
}

export enum ProviderType {
    VALUE,
    CLASS
}

export interface ResolveProviderObject {
    name: string
    value: any
    type: ProviderType
}

export default class IoCContainer {

    private readonly controllers: Map<string, any> = new Map()
    private readonly providers: Map<string, Pick<ResolveProviderObject, 'value' | 'type'>> = new Map()
    private readonly injectableProviders: Map<string, Pick<ResolveProviderObject, 'value' | 'type'>> = new Map()
    private readonly cache: Map<string, any> = new Map()

    constructor(providers: Providers, controllers: Controllers) {
        providers.forEach(Provider => {
            const { name, value, type } = this.resolveProvider(Provider)
            this.providers.set(name, { value, type })
            if (type === ProviderType.VALUE || this.isInjectable(value)) this.injectableProviders.set(name, { value, type })
        })
        controllers.forEach(Controller => this.controllers.set(Controller.name, Controller))
    }

    getController(name: string) {
        const value = this.controllers.get(name)
        if (value) {
            return this.getClass(value)
        }
    }

    getProvider(name: string) {
        const { value, type } = this.providers.get(name) ?? {}
        if (type === ProviderType.CLASS) {
            return this.getClass(value)
        }
        return value
    }


    private getInjectableProvider(name: string) {
        const { value, type } = this.injectableProviders.get(name) ?? {}
        if (type === ProviderType.CLASS) {
            return this.getClass(value)
        }
        return value
    }

    inject(instance: any, providers: Providers) {
        providers.forEach(Provider => {
            const { name, value, type } = this.resolveProvider(Provider)
            this.providers.set(name, { value, type })
            if (type === ProviderType.VALUE || this.isInjectable(value)) this.injectableProviders.set(name, { value, type })
        })
        const Type = instance?.constructor
        // 构造函数注入
        const constructorParameterTypes = Reflect.getMetadata(DESIGN_PARAMTYPES, Type)
        const constructorParameters: string[] = Reflect.getMetadata(DESIGN_PARAMTERS, Type) ?? []

        // 通过@Inject注入
        const injectParameters: InjectMetadata = Reflect.getMetadata(TANFU_INJECT, Type.prototype) ?? {};

        const prototype: Record<string, any> = Reflect.getPrototypeOf(instance) as Record<string, any>

        // 解析构造函数
        constructorParameters.forEach((name, index) => {
            const Type = constructorParameterTypes?.[index]
            if (Type?.constructor) prototype[name] = this.getClass(Type)
        });

        // 解析 @Inject注入的
        Object.keys(injectParameters).forEach(propertyName => {
            const name = injectParameters[propertyName]
            prototype[propertyName] = this.getInjectableProvider(name)
        });
        Reflect.setPrototypeOf(instance, prototype)
    }

    private getClass(Type: Type<any>) {
        let instance = this.cache.get(Type.name)
        // 如果存在则直接获取缓存
        if (instance) return instance;
        instance = createProxy(new Type())
        this.inject(instance, [])
        this.cache.set(Type.name, instance)
        return instance
    }

    /** 是否可被注入 */
    private isInjectable(Provider: ClassProviders) {
        return Reflect.getMetadata(TANFU_INJECTABLE_WATER_MARK, this.resolveProvider(Provider).value)
    }

    /** 解析Provider */
    private resolveProvider(Provider: Providers[0]): ResolveProviderObject {
        return {
            name: typeof Provider === 'object' ? typeof Provider.provide === 'string' ? Provider.provide : Provider.provide.name : Provider.name,
            // @ts-ignore
            value: Provider.useClass ?? Provider.useValue ?? Provider,
            // @ts-ignore
            type: Provider.useValue ? ProviderType.VALUE : ProviderType.CLASS
        }
    }

}

function createProxy(object: any) {
    return new Proxy(object, {
        get(target, key, receiver) {
            return Reflect.get(target, key, receiver) ?? Reflect.get(Reflect.getPrototypeOf(target) ?? {}, key, receiver)
        }
    })
}