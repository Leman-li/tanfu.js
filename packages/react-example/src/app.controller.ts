import { Controller, Engine, EventListener, HostLifeCycle, Inject, LifeCycle, TanfuController, TId } from "tanfu-core";
import type TanfuEngine from "tanfu-core/es/engine/tanfu-engine";
import AppRepository from "./app.repository";

class A {
    constructor(private a:string){

    }
}

@Controller()
export default class AppController extends TanfuController {



     constructor(private repository: AppRepository, @Inject('b') readonly b: AppRepository){ super() }


    @HostLifeCycle('willMount')
    willMount(){
        console.log('willMount', this.repository)
    }

    @EventListener('sss', 'onClick')
    @EventListener('element', 'onClick')
    click(event: Event, @TId() tid: string){
        console.log('点击了', tid, event.target)
        this.setState({
            modalView: {
                visible: true
            }
        })
    
    }


    @HostLifeCycle('didMount')
    hostDidMount(){
        console.log(this.repository, this)
    }

}