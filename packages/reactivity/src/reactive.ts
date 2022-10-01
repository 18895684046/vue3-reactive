

//  是否是浅的 默认是深的

// tsconfig 配置
// "moduleResolution": "node", 
// "baseUrl": "./", 
// "paths": {
//   "@vue/*": [
//     "packages/*/src"
//   ]
// }, 
import { isObject } from "@vue/shared"
import { mutableHandler, readonlyHandlers, shallowReactiveHandlers, shallowReadonlyHandlers } from "./baseHandlers"

//   是否是只读的 默认不是仅读的

export function reactive(target) {
    return createReactiveObject(target, false, mutableHandler)
}

export function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers)
}

export function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers)
}


/**
 * @param {target} 创建代理的目标  
 * @param {isReadonly}  是否是只读的
 * @return {baseHandler}  针对不同的方式创建不同的代理对象
 */
//  weekMap (key 只能是对象) map (key 可以是其他的类型)
// weekMap 是一个弱引用，如果对象被销毁了， weekMap 可以将对象自动释放掉
const reactiveMap = new WeakMap(); // 目的是添加缓存 -- 响应式的
const readonlyMap = new WeakMap(); // 目的是添加缓存 -- 只读的

function createReactiveObject(target, isReadonly, baseHandler) {
    if (!isObject(target)) {
        return target
    }
    const proxyMap = isReadonly ? readonlyMap : reactiveMap

    const existProxy = proxyMap.get(target)
    if (existProxy) {
        return existProxy // 如果已经代理过了，那就直接把上一次的代理返回即可
    }
    // 如果是对象，就做一个 代理 proxy
    const proxy = new Proxy(target, baseHandler)
    proxyMap.set(target, proxy)
    return proxy
}