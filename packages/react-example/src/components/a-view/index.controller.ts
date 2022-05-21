import { Controller, Engine, EventListener } from "tanfu-core";

@Controller()
export default class AViewController {

    value = 1;

    @Engine() engine: any

    @EventListener('div','onClick')
    handleDivClick(){
        this.engine.setState({
            div: {
                children: (this.value = this.value + 1)
            }
        })
    }
    
}