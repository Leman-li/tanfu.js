import { CoreEngine, Engine, EventListener, HostLifeCycle, Inject } from "tanfu-core";
import type TanfuEngine from 'tanfu-core/es/engine/tanfu-engine'
import Model from "./index.model";
import { VirtualListProps } from "./index.view";


export default class VirtualListController {


    @Inject('Model') model!: Model

    @Engine() engine!: TanfuEngine

    @HostLifeCycle('willMount')
    willUpdate() {
        const props = this.engine.getProps()
        this.model.itemHeight = props.itemHeight
        this.model.screenHeight = props.height
        this.model.listData = props.listData
        this.notify()
    }

    @EventListener('v-list-container', 'onScroll')
    onScroll(event: any) {
        this.model.scrollTop = event.target.scrollTop
        this.notify()
    }

    notify(){
        this.engine.setState({
            "v-list-container": {
                style: {
                    height: this.model.screenHeight
                }
            },
            'v-list-inner':{
                style: {
                    height: this.model.getTotalHeight()
                }
            },
            'v-list-content':{
                listData: this.model.getVisibleData(),
                itemHeight: this.model.itemHeight,
                style: {
                    transform: `translate3d(0,${this.model.getOffset()}px,0)`
                }
            }
        })
    }

}
