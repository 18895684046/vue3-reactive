
//  判断是否是对象
export function isObject(target) {
    return typeof target === 'object' && target !== null
}
// 合并对象
export let extend = Object.assign

export function hasChanged(oldValue, newValue) {
    return oldValue !== newValue
}

export let isArray = Array.isArray

//  是否是整数
export const isIntegerKey = (key) => {
    return parseInt(key) + '' === key
}
export const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key)