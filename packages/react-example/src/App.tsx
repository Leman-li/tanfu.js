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


@Component({
  controllers: [AppController],
  providers: [AppRepository],
  declarations: [AView,VirtualList,{name: 'list-item', value: Item}]
})
class App extends TanfuView {

  template(): TemplateObject {
    return html`
    sdaf
    <div>App</div>
    <virtual-list t-id="virtual-list">
      <list-item  data-a="sdf" slot-name="itemNode"/>
    </virtual-list>
    `
  }
}

export default ()=> Tanfu.createApp(App);
