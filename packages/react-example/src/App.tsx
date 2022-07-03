import React from 'react';
import './App.css';
import Tanfu, { Component, TanfuView, html } from 'tanfu-core';
import { TemplateObject } from 'tanfu-core/es/html';
import TanfuReactPlugin from 'tanfu-react-plugin';
import AppController from './app.controller';
import AppRepository from './app.repository';
import AView from './components/a-view';
import VirtualList from './components/virtual-list/index.view';
import Item from './components/item';
Tanfu.use(new TanfuReactPlugin())
Tanfu.directive('number', {
  install(template, binding) {
    const { expression, arg } = binding
    if (template.props && arg) template.props[arg] = parseInt(expression)
  },
})

Tanfu.directive('hide', {
  install(template, binding) {
    const { expression } = binding
    const { tId } = template
    console.log(template.engine)

    if (tId && template.props) {
      if(!template.props.directives) template.props.directives = {}
      Object.defineProperty(template.props.directives, 'hidden', {
        enumerable: true,
        get() {
          const value = template.engine?.getState(tId)?.isHide;
          console.log(value, 'hidden')
          return value;
        },
      })
    }

    console.log(template.props)
  },
})




@Component({
  controllers: [AppController],
  providers: [AppRepository],
  declarations: [AView, VirtualList, { name: 'list-item', value: Item }]
})
class App extends TanfuView {

  template(): TemplateObject {
    const a = html`
    <div t-id="element" t-number:height="100">hhh</div>
    <div t-id="bbb" t-hide="isHide">bbbb<span>sss</span></div>
    `

    console.log(a, '---')
    return a;
  }
}

const root = Tanfu.createApp(App)

export default () => root;
