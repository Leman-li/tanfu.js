import React from "react"

const BComponent = function ({ onClick }: Bprops) {
    return <div onClick={onClick}>这是B组件</div>
}

export default BComponent

export type Bprops = {
    onClick?: () => void
}
