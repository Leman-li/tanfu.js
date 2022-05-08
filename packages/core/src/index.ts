import Tanfu, { Plugin, GLOBAL_ELEMENTS_KEY } from "./tanfu";
import 'reflect-metadata'
import CoreEngine, { Engine } from "./engine";
import html from './html'
import { TanfuView } from './view'
export * from './decorator'
import { InjectorObject } from './ioc'
import 'zone.js'
export default Tanfu
export {
    CoreEngine,
    Engine,
    Plugin,
    GLOBAL_ELEMENTS_KEY,
    html,
    TanfuView,
    InjectorObject
}



