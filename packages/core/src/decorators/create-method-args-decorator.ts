import { TANFU_METHOD_ARGS } from "../constants";

export enum TanfuMethodParamType {
    TANFU_EVENT,
    T_ID
}

type ParamData = string | number | object

export type MethodArgsMetadata = {
    [key: string]: {
        index: number,
        data: ParamData
    }
}

/** 找到参数装饰器的索引 */
export function findArgsDecoratorIndexs(paramtype: TanfuMethodParamType, target: Object, methodName: string) {
    const md: MethodArgsMetadata = Reflect.getMetadata(TANFU_METHOD_ARGS, target, methodName);
    const returnIndexes: number[] = []
    Object.keys(md ?? {}).forEach(key => {
        if (key.startsWith(`${paramtype}`)) {
            returnIndexes.push(md[key].index)
        }
    })
    return returnIndexes.sort((a, b) => b - a);
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