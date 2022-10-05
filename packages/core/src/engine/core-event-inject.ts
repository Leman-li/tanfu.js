import TanfuHook from "../tanfu-hook"
import CoreUpdateState from "./core-update-state"
import { ElementId, PickFunction, PickNotFunction, StringKeys, ViewModel } from "./types"


export default class CoreEventInject<VM extends ViewModel> extends CoreUpdateState<VM> {
    public didMountHook: TanfuHook = new TanfuHook(this.zone)
    public updateHook: TanfuHook = new TanfuHook(this.zone)
    public willUnmountHook: TanfuHook = new TanfuHook(this.zone)
    public willMountHook: TanfuHook = new TanfuHook(this.zone)
    public watchElementHook: TanfuHook = new TanfuHook(this.zone)
    public callbackHook: TanfuHook = new TanfuHook(this.zone)

    /** 组件加载完成 */
    didMount(tId: ElementId<VM>, fn: (dom?: HTMLElement) => void) {
        this.didMountHook.on(tId, fn)
    }

    /** 组件加载完成 */
    willMount(tId: ElementId<VM>, fn: () => void) {
        this.willMountHook.on(tId, fn)
    }

    /** 监听元素属性变化 */
    watchElement<E extends ElementId<VM>>(tId: E, fn: ()=>void, deps: StringKeys<keyof PickNotFunction<VM[E]>>[]) {
        deps?.forEach(dep => {
            this.watchElementHook.on([tId, dep], fn)
        })
    }

     /** 插入回调 */
     injectCallback<E extends ElementId<VM>, F extends StringKeys<keyof PickFunction<VM[E]>>>(tId: E, fnName: F, fn: VM[E][F]) {
        this.callbackHook.on([tId, fnName], fn as any)
    }
}