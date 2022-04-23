import { BView, ViewModel } from '.';
import { Controller, EventListener, Injectable, Inject, LifeCycle, HostLifeCycle, Component, ChildView } from 'tanfu-core/es/decorator';
import Tanfu, { Engine } from '../index'
import { BModel, RootModel } from './index.model';

@Controller()
export class RootController {

    @Inject('engine') engine!: Engine<ViewModel>


    @ChildView('b-view') view!: BView

    constructor(private rootModel: RootModel, private b: string, private bModel: BModel) { }

    @HostLifeCycle('willMount')
    initData() {
        this.engine.setState({
            a: {
                text: this.rootModel.a + this.bModel.a + ''
            }
        })
    }

    @EventListener('b', 'onClick')
    handleClick() {
        console.log(this.rootModel, this)
        console.log('b点击了')
        this.engine.setState({
            a: {
                text: this.rootModel.a + ''
            }
        })
    }

    @HostLifeCycle('didMount')
    didMount(){
        this.view.update()
    }

    @LifeCycle('b', 'didMount')
    bDidMount() {
        console.log('b加载完成了')
    }
}