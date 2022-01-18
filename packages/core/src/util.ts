/** 合并两个对象，排除函数, */
export const assignExcludeFns = (target: Record<string, any>, source: Record<string, any>) => {
    Object.keys(source).forEach(key => {
        if (typeof source[key] !== 'function') {
            target[key] = source[key]
        }
    })
    return target;
}