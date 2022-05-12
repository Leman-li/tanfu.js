import React from 'react';
import logo from './logo.svg';
import './App.css';
import Tanfu, { Component, TanfuView, html } from 'tanfu-core';
import { TemplateObject } from 'tanfu-core/es/html';
import TanfuReactPlugin from 'tanfu-react-plugin';
import AppController from './app.controller';
import AppRepository from './app.repository';
import AView from './components/a-view';
Tanfu.use(new TanfuReactPlugin())


@Component({
  controllers: [AppController],
  providers: [AppRepository],
  declarations: [AView]
})
class App extends TanfuView {

  template(): TemplateObject {
    return html`
    <div>App</div>
    <a-view/>
    `
  }
}


export default ()=>Tanfu.mountView(App);
