import TanfuView from "../view";

// 定义元素id类型
export type ElementId<VM extends ViewModel = ViewModel> = StringKeys<keyof VM>;

export type StringKeys<T> = T extends string ? T : never;


// 定义注入回调函数类型
type InJectCallBackFunction = (...args: any) => void;


type SetStateAction<S> = S | ((prevState: S) => S);

// 定义更新状态
export type SetStatesAction<VM extends ViewModel> = SetStateAction<DeepPartial<{
    [K in keyof VM]: PickNotFunction<VM[K]>
}>>


// 定义view model 类型
export type ViewModel = DeepPartial<{
    [tId: string]: {
        [p: string]: any
    }
}>

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

// 选择一个对象中的函数
export type PickFunction<T> = {
    [K in keyof T as (T[K] extends (Function | undefined) ? K : never)]: T[K]
}

// 选择一个对象中的非函数内容
export type PickNotFunction<T> = {
    [K in keyof T as (T[K] extends (Function | undefined) ? never : K)]: T[K]
}

export interface ViewObject {
    view: TanfuView
    tId?: string
}