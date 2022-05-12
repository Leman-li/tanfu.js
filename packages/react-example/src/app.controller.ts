import { Controller, HostLifeCycle } from "tanfu-core";
import AppRepository from "./app.repository";

class A {
    constructor(private a:string){

    }
}

@Controller()
export default class AppController {

    constructor(private repository: AppRepository){}


    @HostLifeCycle('didMount')
    hostDidMount(){
        console.log(this.repository, this)
    }

}