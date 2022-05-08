import React, { useEffect } from 'react';
import Tanfu from 'tanfu-core';
import { Component, Controller, EventListener, HostLifeCycle } from 'tanfu-core';
import { RootController } from './index.controller';
import { BModel, RootModel } from './index.model';
import { html, TanfuView } from 'tanfu-core';
import TanfuReactPlugin from '..';
import AComponent, { Aprops } from './a-component';
import BComponent, { Bprops } from './b-component';

Tanfu.use(new TanfuReactPlugin())



export type ViewModel = {
    a: Aprops,
    b: Bprops,
    myelementId: Aprops
}



@Component({
    controllers: [RootController],
    providers: [RootModel, BModel],
    declarations: [AComponent, BComponent],
})
class AView extends Tanfu.View {



    template() {
        return html`
        <a-component t-id="a">
            <div t-slot="aElement">aelemen111t</div>
        </a-component>
        SFAF
        <b-component t-id="b"></b-component>
        <button>button</button>
        `
    }
}

const Root = Tanfu.mountView(AView)

export default ({ title }: { title: string }) => Root;



