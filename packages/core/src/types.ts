export interface Type<T = any> extends Function {
  new(...args: any[]): T;
}

export interface DispatchEvent<V = any> {
  type: string;
  payload ?: V
}