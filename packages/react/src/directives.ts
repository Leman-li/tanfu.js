
import TanfuDirective from "tanfu-core/es/directive";
import { TemplateObject, DirectiveBinding } from "tanfu-core/es/html";
import { INNER_DIRECTIVES } from 'tanfu-core/es/constants'
export class HideDirective extends TanfuDirective {
    install(template: TemplateObject, binding: DirectiveBinding): void {
        const { descriptors } = binding
        const { expression } = descriptors[0]
        const { tId } = template
        if (tId && template.props) {
            (template.props[INNER_DIRECTIVES] = template.props[INNER_DIRECTIVES] ?? {});
            Object.defineProperty(template.props[INNER_DIRECTIVES], 'hidden', {
                enumerable: true,
                get() {
                    return template.engine?.getState(tId)?.[expression];
                },
            })
        }
    }
}

export class ModelDirective extends TanfuDirective {
    install(template: TemplateObject, binding: DirectiveBinding): void {
        const { tId, engine } = template
        const { descriptors } = binding
        const valueExpression = descriptors.find(o => o.modifiers?.value )?.expression ?? 'value';
        const changeExpression = descriptors.find(o => o.modifiers?.change)?.expression ?? 'onChange';
        if(tId){
            // @ts-ignore
            engine?.injectCallback(tId, changeExpression, function(value: any){
                engine.setState({
                    [tId]: {
                        [valueExpression]: value
                    }
                })
            })
        }
    }
}