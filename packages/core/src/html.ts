import CoreEngine from "./engine";

export interface TemplateObject {
    children?: Array<TemplateObject>;
    name: string,
    // $host_slot_name存在，表示当前组件时通过slot替换而来
    props?: { [key: string]: any, $slot?: Map<string, TemplateObject> },
    tId?: string,
    type: Node['TEXT_NODE'] | Node['ELEMENT_NODE'],
    /** 在type 为 Node['TEXT_NODE'] 时存储文本值 */
    value?: string | null,
    // name为t-template时存在
    elements?: TemplateObject[],
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
                const $slot: Map<string, TemplateObject> = new Map()
                subChildren.forEach(node => {
                    if (node.props?.['slot-name']) {
                        $slot.set(node.props?.['slot-name'], node)
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
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<t-template>${template}</t-template>`, 'text/xml')
    const root = doc.getElementsByTagName('t-template')[0];
    const elements: TemplateObject[] = []
    return { children: convertNodes(root.childNodes, elements), name: 'template', props: {}, type: Node.ELEMENT_NODE, elements }
}