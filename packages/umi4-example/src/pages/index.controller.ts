import { Controller, HostLifeCycle, TanfuController } from "tanfu-core";
import yayJpg from '../assets/yay.jpg';
@Controller()
export default class IndexController extends TanfuController {

    @HostLifeCycle('willMount')
    willMount() {
        this.setState({
            img: {
                src: yayJpg
            }
        })
    }
}