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
    const a = html`
    <div t-id="element">hhh</div>
    <div>bbbb<span>sss</span></div>
    `
  
  console.log(a,'---')
  return a;
  }
}

export default ()=> Tanfu.createApp(App);
