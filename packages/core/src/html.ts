import CoreEngine from "./engine";

// 指令定义
export interface DirectiveBinding {
    // 不包含 t- 在 t- 和： 之间的值
    name: string
    // 指令表达式
    expression: string
    // 传给指令的参数 如 t-demo:foo // foo
    arg?: string
    // 一个包含修饰符的对象 如 t-demo:foo.a.b  // {a: true, b: true }
    modifiers?: Record<string, boolean>
}

export interface TemplateObject {
    children?: Array<TemplateObject>;
    name: string,
    // $host_slot_name存在，表示当前组件时通过slot替换而来
    props?: { [key: string]: any, $slot?: Record<string, TemplateObject> },
    tId?: string,
    type: Node['TEXT_NODE'] | Node['ELEMENT_NODE'],
    /** 在type 为 Node['TEXT_NODE'] 时存储文本值 */
    value?: string | null,
    directives?: DirectiveBinding[],
    engine?: CoreEngine,
}

/** 转换Nodes方法 */
function convertNodes(nodes: NodeListOf<ChildNode>, elements: TemplateObject[]) {
    const children: Array<TemplateObject> = [];
    nodes.forEach(node => {
        switch (node.nodeType) {
            case Node.TEXT_NODE:
                if (node.nodeValue?.trim() != '') {
                    children.push({
                        name: 'span',
                        type: Node.TEXT_NODE,
                        value: node.nodeValue
                    })
                }
                break;
            case Node.ELEMENT_NODE:
                // @ts-ignore
                const attributes: NamedNodeMap = node.attributes
                const props: TemplateObject['props'] = {}
                for (let i = 0; i < attributes.length; i++) {
                    const { name = '', value } = attributes.item(i) || {}
                    props[name] = value
                }
                const subChildren = convertNodes(node.childNodes, elements);
                const $slot: Record<string, TemplateObject> = {}
                subChildren.forEach(node => {
                    if (node.props?.['slot-name']) {
                        $slot[node.props?.['slot-name']] = node
                    }
                })
                props['$slot'] = $slot
                children.push({
                    name: node.nodeName,
                    props,
                    children: subChildren,
                    tId: props['t-id'],
                    type: Node.ELEMENT_NODE
                })
        }
    })
    elements.push(...children)
    return children
}

/** 将html字符串转换为 templateObject对象 */
export default function html(template: TemplateStringsArray): TemplateObject {
    // @ts-ignore
    return template as TemplateObject
}