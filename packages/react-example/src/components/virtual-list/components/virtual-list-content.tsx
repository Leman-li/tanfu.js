import React from "react";
import { VirtualListProps } from "../index.view";


export interface VirtualListContentProps extends VirtualListProps {
    listData: any[],
    className?: string
    style: React.CSSProperties
}
export default function VirtualListContent(props: VirtualListContentProps) {
    const { listData, itemHeight, itemNode, className, style } = props
    return (
        <div className={className} style={style}>
            {listData?.map((data, index) => (
                <div key={index} style={{ height: itemHeight }}>
                    {itemNode && React.cloneElement(itemNode as any, { data })}
                </div>
            ))}
        </div>
    )
}