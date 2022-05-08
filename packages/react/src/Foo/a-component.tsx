import React from "react"

export type Aprops = {
    text?: string,
    aElement?: React.ReactNode
}

const AComponent = function ({ text, aElement }: Aprops) {
    return <div>{aElement}这是A组件{text}
    <input></input>
    </div>
}

export default AComponent
