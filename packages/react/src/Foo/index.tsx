import React, {useEffect } from 'react';
import Tanfu from 'tanfu-core';
import {Component, Controller, EventListener, HostLifeCycle } from 'tanfu-core/es/decorator';
import { RootController } from './index.controller';
import { BModel, RootModel } from './index.model';
import { html, TanfuView } from 'tanfu-core';
import { TanfuReactPlugin } from '..';

Tanfu.use(new TanfuReactPlugin())
export default ({ title }: { title: string }) => <Root />;



const AComponent = function ({ text }: Aprops) {
    return <div>这是A组件{text}</div>
}



const BComponent = function ({ onClick }: Bprops) {
    return <div onClick={onClick}>这是B组件</div>
}

@Controller()
class BController{

    @HostLifeCycle('didMount')
    didMount(){
        console.log('Bview加载完成了')
    }

    @EventListener('div','onClick')
    updateDataSource(){
        console.log('更新了dataSource')
    }
}

@Component({ controllers: [BController]})
export class BView extends TanfuView {


   update(){
       console.log('触发了自view的方法')
       this.dispatchEvent({type: 'div/onClick',payload: undefined })
   }

   template(){
       return html`
         <div element-id='div'>自定义的view</div>
       `
   }
}


@Component({
    controllers: [RootController],
    providers: [RootModel, BModel],
    declarations: [AComponent, BComponent,BView],
})
class AView extends Tanfu.View {



    template() {
        return html`
        <a-component element-id="a">
        </a-component>
        SFAF
        <b-component element-id="b"></b-component>
        <b-view element-id="b-view"/>
        `
    }
}

const Root = Tanfu.mountView(AView)





export type ViewModel = {
    a: Aprops,
    b: Bprops,
    myelementId: Aprops
}

type Aprops = {
    text?: string
}

type Bprops = {
    onClick?: () => void
}

