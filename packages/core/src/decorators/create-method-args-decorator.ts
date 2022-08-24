import { TANFU_METHOD_ARGS } from "../constants";

export enum TanfuMethodParamType {
    TANFU_EVENT,
    T_ID
}

type ParamData = string | number | object

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
            const args =
                Reflect.getMetadata(TANFU_METHOD_ARGS, target.constructor, key) || {};
            Reflect.defineMetadata(
                TANFU_METHOD_ARGS,
                assignMetadata(
                    args,
                    paramtype,
                    index,
                    data,
                ),
                target.constructor,
                key,
            );
        };
}