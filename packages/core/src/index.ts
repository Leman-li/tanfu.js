
import 'reflect-metadata'
import 'zone.js'
import Tanfu from './tanfu';
export default Tanfu

export { default as CoreEngine } from './engine'
export { default as TanfuView } from './view'
export { default as TanfuAdapter } from './adapter'
export { default as Controller } from './decorators/constroller'
export { default as Inject } from './decorators/inject'
export { default as Injectable } from './decorators/injectable'
export { default as TId } from './decorators/t-id'
export { default as Component } from './decorators/component'
export { default as ChildView } from './decorators/child-view'
export { default as LifeCycle, HostLifeCycle } from './decorators/lifecycle'
export { default as WatchElement, WatchHostElement } from './decorators/watch-element'
export { default as EventListener } from './decorators/event-listener'
export { default as Engine } from './decorators/engine'
export { default as html } from './html'
export { default as TanfuPlugin } from './plugin'





