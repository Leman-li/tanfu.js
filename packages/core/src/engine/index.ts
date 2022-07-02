import { HOST_LIFECYCLE_ID, TANFU_CHILD_VIEW } from '../constants';
import { Controllers, Declarations, Providers } from '../ioc';
import { ViewModel, ViewObject } from './types';
import TanfuView from '../view';
import CoreMetadataInject from './core-metadata-inject';
import { TemplateObject } from '../html';



/** 核心引擎 */
export default class CoreEngine<VM extends ViewModel = ViewModel> extends CoreMetadataInject<VM> {

    private readonly declarations: Map<string, any> = new Map()
    private readonly parentEngine!: CoreEngine | null | undefined
    private readonly childViews = new Map<string, any>();
    private hostView!: TanfuView;
    public $slot: Record<string,TemplateObject> = {}

    constructor(parentEngine: CoreEngine, providers: Providers, controllers: Controllers, view: ViewObject) {
        super(providers, controllers)
        this.parentEngine = parentEngine
        this.addHostView(view)
        this.didMountHook.interceptor.before.push((name) => {
            if (name === HOST_LIFECYCLE_ID) {
                controllers.forEach(Controller => {
                    let providers: Providers = [];
                    this.childViews.forEach((view, tId) => {
                        providers.push({
                            provide: TANFU_CHILD_VIEW + tId,
                            useValue: view
                        })
                    })
                    this.ioc.inject(this.ioc.getController(Controller.name), providers)
                })
            }
        })
    }

    /** 添加声明 */
    addDeclarations(declarations: Declarations) {
        declarations.forEach(({ name, value }) => {
            this.declarations.set(name, value)
        })
    }

    /** 添加主视图 */
    private addHostView(viewObject: ViewObject) {
        const { view } = viewObject
        this.hostView = view;
        this.hostView['dispatchEvent'] = ({ type, payload }) => {
            const [tId, callbackName] = type?.split('/') || []
            this.callbackHook.call([tId, callbackName], payload)
        }
        this.parentEngine?.addChildView(viewObject)
    }

    private addChildView(viewObject: ViewObject) {
        const { tId, view } = viewObject
        if (tId) this.childViews.set(tId, view)
    }

    /** 找到声明 */
    getDeclaration(name: string): any {
        return this.declarations.get(name) ?? this.parentEngine?.getDeclaration(name)
    }



}