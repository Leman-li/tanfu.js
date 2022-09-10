/** 合并两个对象，排除函数, */
export const assignExcludeFns = (target: Record<string, any>, source: Record<string, any>) => {
    Object.keys(source).forEach(key => {
        if (typeof source[key] !== 'function') {
            target[key] = source[key]
        }
    })
    return target;
}

export function getParameterNames(fn: Function) {
    if (typeof fn !== 'function') return [];
    var COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var code = fn.toString().replace(COMMENTS, '');
    var result = code.slice(code.indexOf('(') + 1, code.indexOf(')'))
        .match(/([^\s,]+)/g);
    return result === null
        ? []
        : result;
}

export function isObject(it: any) {
    return typeof it === 'object' ? it !== null : typeof it === 'function'
}

/** 排除对象中的某些字段 */
export function omit(object: Record<string, any> = {}, ...omitNames: string[]) {
    const returnObject = { ...object };
    omitNames.forEach(name => {
        delete returnObject[name]
    })
    return returnObject
}