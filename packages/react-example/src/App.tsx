import React from 'react';
import './App.css';
import Tanfu, { Component, TanfuView, html, Controller, WatchHostElement, HostLifeCycle, EventListener, Engine, WatchElement } from 'tanfu-core';
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
  didMount() {
    console.log(this.engine)
  }

  @WatchHostElement(['visible'])
  watchModal() {
    console.log('propschange', this.engine.getProps())
  }


}

@Component({
  controllers: [ModalController],
  declarations: [{
    name: 'ant-modal',
    value: Modal
  }]
})
class ModalView1 extends TanfuView {

  propsToState(props: Record<string, any>): Record<string, Record<string, any>> {
    return {
      modal: {
        visible: props.visible,
        onCancel: () => props?.onCancel?.(false)
      }
    }
  }


  template(): TemplateObject {
    return html`<ant-modal title="TanfuView" t-id="modal">afdaf</ant-modal>`
  }
}

@Controller()
class ExtendController {

  @Engine() engine!: TanfuEngine

  @EventListener('modal', 'onOk')
  onOk() {
    console.log('点击O看了')
    this.engine.getProps()?.onCancel?.(false)

  }
}


@Component({
  controllers: [ExtendController]
})
class ModalView extends ModalView1 {

  template(): TemplateObject {
    return html`<div>
      <ant-modal title="TanfuView" t-id="modal">afdaf</ant-modal>
  <span>sdfafasfd</span>
</div>`

  }
}



@Component({
  controllers: [AppController],
  providers: [AppRepository],
  declarations: [AView, VirtualList, { name: 'list-item', value: Item }, ModalView]
})
class App extends TanfuView {


  template(): TemplateObject {
    const app = html`
    <div t-id="sss">sss</div>
    <div t-id="element" t-number:height="100">hhh</div>
    <modal-view t-model.value="visible" t-model.change="onCancel" t-id="modalView" />
    `
    console.log(app)
    return app
  }
}


const root = Tanfu.createApp(App)

export default () => root;
