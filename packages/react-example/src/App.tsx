import React from 'react';
import './App.css';
import Tanfu, { Component, TanfuView, html, Controller, LifeCycle, HostLifeCycle, EventListener, Engine } from 'tanfu-core';
import { TemplateObject } from 'tanfu-core/es/html';
import TanfuReactPlugin from 'tanfu-react-plugin';
import AppController from './app.controller';
import AppRepository from './app.repository';
import AView from './components/a-view';
import VirtualList from './components/virtual-list/index.view';
import Item from './components/item';
import 'antd/dist/antd.css';
import { Modal } from 'antd'
import type TanfuEngine from 'tanfu-core/es/engine/tanfu-engine';
Tanfu.use(new TanfuReactPlugin())

@Controller()
class ModalController {

  @Engine() engine!: TanfuEngine


   @HostLifeCycle('didMount')
  didMount(){
    console.log('modal', this.engine)
  }

  @EventListener('modal', 'onCancel')
  onClose(){
    this.engine.setState({
      modal: {
        visible: false
      }
    })
  }
}

@Component({
  controllers: [ModalController],
  declarations: [{
    name: 'ant-modal',
    value: Modal
  }]
})
class ModalView extends TanfuView {

  propsToState(props: Record<string, any>): Record<string, Record<string, any>> {
    console.log('props', props)
    return {
      modal: {
        visible: props.visible
      }
    }
  }

  template(): TemplateObject {
    return html`<ant-modal title="TanfuView" t-id="modal"></ant-modal>`
  }
}

@Component({
  controllers: [AppController],
  providers: [AppRepository],
  declarations: [AView, VirtualList, { name: 'list-item', value: Item },ModalView]
})
class App extends TanfuView {


  template(): TemplateObject {
    const a = html`
    <div t-id="element" t-number:height="100">hhh</div>
    <div t-id="ssss">bbbb<span>sss</span></div>
    <a-view t-id="bbb" t-hide="isHide"/>
    <modal-view t-id="modalView"/>
    `

    console.log(a, '---')
    return a;
  }
}


const root = Tanfu.createApp(App)

export default () => root;
