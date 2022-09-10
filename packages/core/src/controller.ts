import Engine from "./decorators/engine";
import TanfuEngine from "./engine/tanfu-engine";
import { ElementId, PickNotFunction, SetStatesAction, ViewModel } from "./engine/types";


export default class TanfuController<VM extends ViewModel = ViewModel, P = Record<string, any>> {
    @Engine() private engine!: TanfuEngine<VM, P>

    setState(state: SetStatesAction<VM>) {
        this.engine.setState(state)
    }
    getState<E extends ElementId<VM>>(tId: E): PickNotFunction<VM[E]> {
        return this.engine.getState(tId)
    }
    getProps(): P {
        return this.engine.getProps()
    }
}