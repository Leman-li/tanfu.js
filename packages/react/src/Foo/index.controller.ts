import { ViewModel } from '.';
import { Controller, EventListener, Inject, LifeCycle, HostLifeCycle, Component, ChildView } from 'tanfu-core';
import Tanfu, { Engine } from '../index'
import { BModel, RootModel } from './index.model';

@Controller()
export class RootController {

    @Inject('engine') engine!: Engine<ViewModel>

    value = 1

    constructor(private rootModel: RootModel, private b: string, private bModel: BModel) { }

    @HostLifeCycle('willMount')
    initData() {
        this.engine.setState({
            a: {
                text: this.value + ''
            }
        })
    }

    @EventListener('b', 'onClick')
    async handleClick() {
        this.engine.setState({
            a: {
                text: ++this.value + ''
            }
        })

    }

    delay(num: number) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true)
            }, num)
        })
    }

    @LifeCycle('b', 'didMount')
    bDidMount() {
        console.log('b加载完成了')
    }
}