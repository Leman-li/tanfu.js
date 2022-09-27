import React from 'react'
import htmlTag from "./html-tag";
import { Declarations } from 'tanfu-core/es/ioc'


const reactDeclarations: Declarations ={
}

Object.keys(htmlTag).forEach(name => {
    const Tag = htmlTag[name]
    // @ts-ignore
    reactDeclarations[name] = React.forwardRef((props: Record<string, any>, ref) => <Tag {...props} ref={ref}/>)
})

export default reactDeclarations
