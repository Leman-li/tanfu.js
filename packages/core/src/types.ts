export interface Type<T = any> extends Function {
  new(...args: any[]): T;
}

/** 渲染的元素 */
export type RenderElement = any;

/** 元素 */
export type Element = any;

/** 元素属性 */
export type ElementProps = Record<string, any>

/** 元素类型 */
export enum ElementType {
  /** 文本节点 */
  TEXT_NODE = Node.TEXT_NODE,
  /** 元素节点 */
  ELEMENT_NODE = Node.ELEMENT_NODE
}

export interface DispatchEvent<V = any> {
  type: string;
  payload?: V
}