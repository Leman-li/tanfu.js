import { Controller, Engine, EventListener, HostLifeCycle } from "tanfu-core";

@Controller()
export default class AViewController {

    value = 1;

    @Engine() engine: any

    @HostLifeCycle('didMount')
    didMount(){
        console.log(this.engine.getProps(),'--')
    }

    @EventListener('div','onClick')
    handleDivClick(){
        console.log('click')
        this.engine.setState({
            div: {
                children: (this.value = this.value + 1)
            }
        })
    }
    
}