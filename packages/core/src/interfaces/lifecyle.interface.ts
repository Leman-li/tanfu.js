import TanfuHook from "../tanfu-hook"


export default interface ILifeCycle {
    didMountHook: TanfuHook;
    updateHook: TanfuHook;
    willUnmountHook: TanfuHook
    willMountHook: TanfuHook
}