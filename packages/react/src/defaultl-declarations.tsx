import { ComponentArguments } from ".";
import React from 'react'

const defaultDeclarations: ComponentArguments['declarations'] = [
    {
        name: 'div',
        value: (props) => {
            return <div {...props}/>
        }
    },
    {
        name: 'span',
        value: (props) => <span {...props}/>
    },
    {
        name: 'a',
        value: (props) => <a {...props}/>
    }
]

export default defaultDeclarations