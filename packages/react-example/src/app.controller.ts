import { Controller, Engine, EventListener, HostLifeCycle, Inject, LifeCycle } from "tanfu-core";
import type TanfuEngine from "tanfu-core/es/engine/tanfu-engine";
import AppRepository from "./app.repository";

class A {
    constructor(private a:string){

    }
}

@Controller()
export default class AppController {

    @Inject('AppRepository') repository!: AppRepository

    @Engine() engine!: TanfuEngine

    @HostLifeCycle('willMount')
    willMount(){
        console.log('willMount', this)
        this.engine.setState({
            'virtual-list':{
                height: 300,
                itemHeight: 50,
                listData: Array(100000).fill(1).map((value, index)=> index)
            }
        })
    }

    @EventListener('element', 'onClick')
    click(){
      
       const { isHide } = this.engine.getState('bbb') ?? {}
       console.log('click', isHide)
       this.engine.setState({
        bbb: {
            isHide: !isHide 
        }
       })
    }


    @HostLifeCycle('didMount')
    hostDidMount(){
        console.log(this.repository, this)
    }

}