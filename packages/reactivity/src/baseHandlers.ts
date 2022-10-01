import { extend } from "@vue/shared"

function createGetter(isReadonly = false, shallow = false) {
    /**
     * @param {target} 目标元对象
     * @param {key}  去取的属性
     * @return {receiver} 代理对象 
     */
    return function get(target, key, receiver) {
        console.log('get~~');
        // return target[key]
        return Reflect.get(target, key)
    }
}

function createSetter(shallow = false) {
    return function set() {
        console.log('set~~');
    }
}

// get 方法
const get = createGetter() // 默认不是只读的， 也不是浅的
const shallowGet = createGetter(false, true)
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)


// set 方法
const set = createSetter() // 默认不是只读的， 也不是浅的
const shallowSet = createSetter(true)
// 只读数据 set 应该提示错误 --- 【readonly 没有 set】
let readonlySet = {
    set(target, key) {
        console.warn(`cannot set ${JSON.stringify(target)} on key ${key} failed`);
    }
}
//  不同的处理函数
export const mutableHandler = {
    get: get,
    set

}
export const shallowReactiveHandlers = {
    get: shallowGet,
    set: shallowSet
}
export const readonlyHandlers = extend({
    get: readonlyGet,
}, readonlySet)

export const shallowReadonlyHandlers = extend({
    get: shallowReadonlyGet
}, readonlySet)