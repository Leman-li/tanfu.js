import CoreUpdateState from "./core-update-state";
import { ViewModel } from "./types";


export default interface TanfuEngine<VM extends ViewModel = ViewModel, P = Record<string, any>> {

    getState: CoreUpdateState<VM>['getState']

    setState: CoreUpdateState<VM>['setState']

    getProps: () => P
}