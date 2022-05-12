import CoreUpdateState from "./core-update-state";


export default interface TanfuEngine<VM> {

    getState: CoreUpdateState<VM>['getState']

    setState: CoreUpdateState<VM>['setState']

    getProps: () => Record<string, any>
}