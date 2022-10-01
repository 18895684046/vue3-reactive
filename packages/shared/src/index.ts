
//  判断是否是对象
export function isObject(target) {
    return typeof target === 'object' && target !== null
}
// 合并对象
export let extend = Object.assign