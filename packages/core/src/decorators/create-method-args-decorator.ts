import { TANFU_METHOD_ARGS } from "../constants";

export enum TanfuMethodParamType {
    TANFU_EVENT,
    TANFU_CONSTRUCTOR_INJECT,
    T_ID
}

type ParamData = string | number | object


export type MethodArgsMetadataValue = {
    index: number,
    data?: ParamData
}

export type MethodArgsMetadata = Record<string, MethodArgsMetadataValue>

/** 找到参数装饰器的索引 */
export function findArgsDecoratorValues(paramtype: TanfuMethodParamType, target: Object, methodName: string) {
    const md: MethodArgsMetadata = Reflect.getMetadata(TANFU_METHOD_ARGS, target, methodName);
    const _return: Array<MethodArgsMetadataValue> = []
    Object.keys(md ?? {}).forEach(key => {
        if (key.startsWith(`${paramtype}`)) {
            _return.push(md[key])
        }
    })
    return _return.sort((a, b) => b.index - a.index);
}

function assignMetadata(
    args: object,
    paramtype: TanfuMethodParamType,
    index: number,
    data?: ParamData,
) {
    return {
        ...args,
        [`${paramtype}:${index}`]: {
            index,
            data,
        },
    };
}

/** 创造方法参数装饰器 */
export function createMethodArgsDecorator(paramtype: TanfuMethodParamType) {
    return (data?: ParamData): ParameterDecorator =>
        (target, key, index) => {
            let _target = target;
            // 如果key为constructor说明是构造函数的参数装饰器，否则为一般函数的参数装饰器
            if (key !== 'constructor') _target = target.constructor
            const args =
                Reflect.getMetadata(TANFU_METHOD_ARGS, _target, key) || {};
            Reflect.defineMetadata(
                TANFU_METHOD_ARGS,
                assignMetadata(
                    args,
                    paramtype,
                    index,
                    data,
                ),
                _target,
                key,
            );
        };
}