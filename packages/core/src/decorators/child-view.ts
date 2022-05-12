
import { TANFU_CHILD_VIEW } from "../constants"
import Inject, { InjectMetadata } from "./inject"

export type ChildViewMetadata = InjectMetadata

/** 获取子视图 */
export default function ChildView(tId: string) {
    return Inject(TANFU_CHILD_VIEW + tId)
}