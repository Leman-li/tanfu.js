const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default
const t = require('@babel/types')
const { DOMParser } = require('@xmldom/xmldom')

module.exports = function (source) {
    if (this.cacheable) {
        this.cacheable()
    }
    console.log('加载了loader')
    var ast = parse(source, {
        // parse in strict mode and allow module declarations
        sourceType: "module",

        plugins: [
            // enable jsx and flow syntax
            "jsx",
            "typescript",
            "decorators-legacy",
        ]
    })
    traverse(ast, {
        ClassDeclaration(path) {
            if (t.isIdentifier(path.node?.superClass) && path.node.superClass.name === 'TanfuView') {
                traverse(path.node, {
                    TaggedTemplateExpression(_path) {
                        if (t.isIdentifier(_path.node.tag) && _path.node.tag.name === 'html') {
                            const value = _path.node.quasi.quasis?.[0]?.value.raw
                            if (value) {
                                _path.replaceWith(t.callExpression(t.identifier('html'), [html(value)]))
                            } else {
                                _path.replaceWith(t.callExpression(t.identifier('html'), [ObjectExpression({})]))
                            }
                        }
                    },
                }, path.scope, null, path.parentPath)
            }
        }
    })
    const { code } = generate(ast, { /* options */ }, source);
    return code
}

const tNode = {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1
}

/** 转换Nodes方法 */
function convertNodes(nodes) {
    const children = [];
    Object.values(nodes ?? {}).forEach(node => {
        switch (node.nodeType) {
            case tNode.TEXT_NODE:
                if (node?.nodeValue?.trim() != '') {
                    children.push({
                        name: 'span',
                        type: tNode.TEXT_NODE,
                        value: node.nodeValue
                    })
                }
                break;
            case tNode.ELEMENT_NODE:
                // @ts-ignore
                const attributes = node.attributes
                const directives = [];
                const props = {}
                for (let i = 0; i < attributes?.length; i++) {
                    const { name = '', value } = attributes.item(i) || {}
                    // 如果名称以 t- 开头 说明是指令
                    if (name?.startsWith('t-')) {
                        const _name = name?.match(/t-(\w+)/g)?.[0]?.replaceAll("t-", "");
                        const arg = name?.match(/\:(\w+)/g)?.[0]?.replaceAll(":", "")
                        let modifiers = {};
                        name?.match(/\.(\w+)/g)?.forEach(key => {
                            modifiers[key.replaceAll(".", "")] = true
                        })
                        // 执行的描述
                        const descriptor = {
                            expression: value,
                            arg,
                            modifiers
                        }
                        const directive = directives.find(o => o.name === _name)
                        // 如果存在，则直接推送
                        if(directive) directive.descriptors.push(descriptor)
                        else
                        directives.push({
                            name: _name,
                            descriptors: [descriptor]
                        })

                    } else props[`${name}`] = value
                }
                const subChildren = convertNodes(node.childNodes);
                const $slot = {}
                subChildren.forEach(node => {
                    if (node.props?.['slot-name']) {
                        $slot[node.props?.['slot-name']] = node
                    }
                })
                props['$slot'] = $slot
                children.push({
                    name: node.nodeName,
                    directives,
                    props,
                    children: subChildren,
                    tId: props['t-id'],
                    type: tNode.ELEMENT_NODE
                })
        }
    })
    return children
}


function getLiteral(value) {
    if (value instanceof TanFuObjectExpression) return value.expression;
    if (value instanceof TanFuArrayExpression) return value.expression;
    if (t.isExpression(value)) return value;
    if (typeof value === 'string') return t.stringLiteral(value)
    if (typeof value === 'number') return t.numericLiteral(value)
    if (typeof value === 'boolean') return t.booleanLiteral(value)
    if (Object.prototype.toString.call(value)?.includes('Object')) return ObjectExpression(value)
    if (Object.prototype.toString.call(value).includes('Array')) return ArrayExpression(value)
    return t.nullLiteral()
}

class TanFuObjectExpression {
    constructor(object) {
        this.expression = ObjectExpression(object)
    }

    addProperty(key, value) {
        this.expression.properties.push(
            t.objectProperty(t.identifier(key), getLiteral(value))
        )
    }

    get(key) {
        return this.expression.properties.find(item => item.key.name === key)
    }
}

class TanFuArrayExpression {
    constructor(arr) {
        this.expression = ArrayExpression(arr || [])
    }

    push(...args) {
        this.expression.elements.push(...args?.map(value => getLiteral(value)))
    }
}

function ObjectExpression(object) {
    const expression = t.objectExpression([])
    Object.keys(object).forEach(key => {
        expression.properties.push(
            t.objectProperty(t.identifier(key), getLiteral(object[key]))
        )
    })
    return expression;
}

function ArrayExpression(arr) {
    const expression = t.arrayExpression()
    arr.forEach(item => {
        expression.elements.push(getLiteral(item))
    })
    return expression
}

/** 将html字符串转换为 templateObject对象 */
function html(template) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<t-template>${template}</t-template>`, 'text/xml')
    const root = doc.getElementsByTagName('t-template')[0];
    const rootElements = { children: convertNodes(root.childNodes), name: 'template', props: {}, type: tNode.ELEMENT_NODE }
    return ObjectExpression(rootElements)
}