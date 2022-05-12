import Tanfu from "./tanfu";


export default class TanfuPlugin {
    install(tanfu: Tanfu) { }
}

// 函数式插件
type PluginFunction = (tanfu: Tanfu) => void
// 对象式插件
type PluginObject = { install: (tanfu: Tanfu) => void }
// 插件
export type Plugin = PluginFunction | PluginObject | TanfuPlugin