import React from 'react'
import htmlTag from "./html-tag";
import { Declarations } from 'tanfu-core/es/ioc'


const reactDeclarations: Declarations = Object.keys(htmlTag).map(key => createDeclaration(htmlTag[key]))

export default reactDeclarations

function createDeclaration(tag: keyof JSX.IntrinsicElements) {
    const Tag = htmlTag[tag]
    return {
        name: tag,
        // @ts-ignore
        value: React.forwardRef((props: any, ref) => <Tag {...props} ref={ref}/>)
    }
}