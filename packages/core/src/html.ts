
export interface TemplateObject {
    children?: Array<TemplateObject>;
    name: string,
    props?: { [key: string]: any },
    tId?: string,
    type: Node['TEXT_NODE'] | Node['ELEMENT_NODE'],
    /** 在type 为 Node['TEXT_NODE'] 时存储文本值 */
    value?: string | null
}

/** 转换Nodes方法 */
function convertNodes(nodes: NodeListOf<ChildNode>) {
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
            default:
                // @ts-ignore
                const attributes: NamedNodeMap = node.attributes
                const props: TemplateObject['props'] = {}
                for (let i = 0; i < attributes.length; i++) {
                    const { name = '', value } = attributes.item(i) || {}
                    props[name] = value
                }
                children.push({
                    name: node.nodeName,
                    props,
                    children: convertNodes(node.childNodes),
                    tId: props['element-id'],
                    type: Node.ELEMENT_NODE
                })
        }
    })
    return children
}

/** 将html字符串转换为 templateObject对象 */
export default function html(template: TemplateStringsArray): TemplateObject {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<template>${template}</template>`, 'text/xml')
    const root = doc.getElementsByTagName('template')[0]
    return { children: convertNodes(root.childNodes), name: 'template', props: {}, type: Node.ELEMENT_NODE }
}